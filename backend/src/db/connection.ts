import mysql from 'mysql2/promise';
import type {Pool,PoolConnection} from 'mysql2/promise';
import {databaseConfig,serverConfig} from '../config.ts';
// DECIMAL and BIGINT remain strings; convert explicitly at presentation boundaries.
export function createAppPool(){
 return mysql.createPool({...databaseConfig(),connectionLimit:serverConfig().poolSize,waitForConnections:true,queueLimit:50});
}
export async function migrationConnection(){const connection=await mysql.createConnection(databaseConfig('migration'));await connection.query("SET SESSION time_zone = '+00:00'");return connection;}
export async function withTransaction<T>(pool:Pool,work:(connection:PoolConnection)=>Promise<T>):Promise<T>{
 const connection=await pool.getConnection();
 try{await connection.beginTransaction();const result=await work(connection);await connection.commit();return result;}
 catch(error){await connection.rollback();throw error;}
 finally{connection.release();}
}
