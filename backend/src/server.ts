import {createServer} from 'node:http';
import type {RowDataPacket} from 'mysql2/promise';
import {createAppPool} from './db/connection.ts';
import {serverConfig} from './config.ts';
import {migrationFiles} from './db/migrations.ts';
const pool=createAppPool(),config=serverConfig();
const expectedFiles=await migrationFiles();
const expectedMigrations=expectedFiles.length;
async function ready(){
 const [version]=await pool.query<RowDataPacket[]>('SELECT VERSION() AS version');
 if(!String(version[0].version).startsWith('8.4.'))throw new Error('MySQL 8.4 is required');
 const [rows]=await pool.query<RowDataPacket[]>('SELECT name,checksum,applied_at FROM schema_migrations');
 if(rows.length!==expectedMigrations||expectedFiles.some(file=>!rows.some(row=>row.name===file.name&&row.checksum===file.checksum&&row.applied_at)))throw new Error('Pending, modified or incomplete migrations');
}
const server=createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');res.end(JSON.stringify({error:'method_not_allowed'}));return;}
 const path=new URL(req.url||'/',`http://${config.host}`).pathname;
 if(path==='/health/live'){res.end(JSON.stringify({status:'ok',service:'fitin-backend'}));return;}
 if(path==='/health/ready'){
  try{await ready();res.end(JSON.stringify({status:'ready',database:'mysql',schema:expectedMigrations}));}
  catch{res.statusCode=503;res.end(JSON.stringify({status:'unavailable'}));}return;
 }
 res.statusCode=404;res.end(JSON.stringify({error:'not_found'}));
});
server.requestTimeout=15000;server.headersTimeout=10000;
async function stop(){server.close(async()=>{await pool.end();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.once('SIGINT',stop);process.once('SIGTERM',stop);
server.on('error',async(error)=>{console.error('Backend listener failed:',(error as NodeJS.ErrnoException).code||'unknown');await pool.end();process.exitCode=1;});
try{await ready();server.listen(config.port,config.host,()=>console.log(`FitIn backend listening on ${config.host}:${config.port}`));}
catch(error){console.error('Backend startup failed. Check MySQL 8.4, credentials and migrations.');await pool.end();process.exitCode=1;}
