import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import type {RowDataPacket} from 'mysql2/promise';
import {migrationConnection} from './connection.ts';
export const migrationDirectory=new URL('../../migrations/',import.meta.url);
export async function migrationFiles(){
 const names=(await readdir(migrationDirectory)).filter(n=>/^\d{4}_[a-z_]+\.sql$/.test(n)).sort();
 if(!names.length)throw new Error('No migrations found');
 return Promise.all(names.map(async name=>{const sql=await readFile(new URL(name,migrationDirectory),'utf8');return {name,sql,checksum:createHash('sha256').update(sql).digest('hex')};}));
}
export async function migrate(statusOnly=false){
 const connection=await migrationConnection();
 const lockName=`fitin:migrations:${createHash('sha256').update(String(connection.config.database)).digest('hex').slice(0,32)}`;
 let locked=false;
 try{
  const [lock]=await connection.execute<RowDataPacket[]>('SELECT GET_LOCK(?,10) AS acquired',[lockName]);
  if(Number(lock[0].acquired)!==1)throw new Error('Another migration process holds the lock');locked=true;
  await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
   name VARCHAR(191) COLLATE utf8mb4_0900_bin PRIMARY KEY,
   checksum CHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
   started_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
   applied_at DATETIME(6) NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
  const files=await migrationFiles();
  const [rows]=await connection.query<RowDataPacket[]>('SELECT name,checksum,applied_at FROM schema_migrations ORDER BY name');
  const known=new Map(files.map(file=>[file.name,file]));
  for(const row of rows){
   if(!known.has(row.name))throw new Error(`Applied migration missing from checkout: ${row.name}`);
   if(known.get(row.name)!.checksum!==row.checksum)throw new Error(`Migration checksum changed: ${row.name}`);
   if(!row.applied_at)throw new Error(`Incomplete migration: ${row.name}. Inspect the table and migration ledger; automatic retries are intentionally disabled. See docs/database-setup.md.`);
  }
  const applied=new Set(rows.map(row=>row.name));
  let appliedCount=0;
  for(const file of files){
   if(applied.has(file.name)){if(statusOnly)console.log(`APPLIED ${file.name}`);continue;}
   if(statusOnly){console.log(`PENDING ${file.name}`);continue;}
   // MySQL DDL implicitly commits. Every file is one atomic statement, with a durable started marker.
   await connection.execute('INSERT INTO schema_migrations (name,checksum) VALUES (?,?)',[file.name,file.checksum]);
   await connection.query(file.sql);
   await connection.execute('UPDATE schema_migrations SET applied_at=CURRENT_TIMESTAMP(6) WHERE name=?',[file.name]);
   console.log(`APPLIED ${file.name}`);appliedCount++;
  }
  return {total:files.length,applied:statusOnly?rows.length:rows.length+appliedCount,newlyApplied:appliedCount};
 }finally{
  if(locked)await connection.execute('SELECT RELEASE_LOCK(?)',[lockName]);
  await connection.end();
 }
}
