import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const envFile=fileURLToPath(new URL('../../.env',import.meta.url));
if(existsSync(envFile))process.loadEnvFile(envFile);
function integer(name:string,fallback:number,min:number,max:number){
 const value=Number(process.env[name]??fallback);
 if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Invalid ${name}`);
 return value;
}
function required(name:string){const value=process.env[name];if(!value)throw new Error(`Missing ${name}. Run npm run db:configure at the repository root.`);return value;}
export function databaseConfig(role:'app'|'migration'='app'){
 const database=process.env.MYSQL_DATABASE||'fitin';
 if(!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(database))throw new Error('Invalid MYSQL_DATABASE');
 return {host:process.env.DB_HOST||'127.0.0.1',port:integer('DB_PORT',3307,1,65535),database,
  user:role==='app'?'fitin_app':'fitin_migrator',password:required(role==='app'?'MYSQL_APP_PASSWORD':'MYSQL_MIGRATION_PASSWORD'),
  timezone:'Z',charset:'utf8mb4',supportBigNumbers:true,bigNumberStrings:true,dateStrings:true,
  decimalNumbers:false,multipleStatements:false,connectTimeout:10000,enableKeepAlive:true};
}
export function serverConfig(){return {host:process.env.BACKEND_HOST||'127.0.0.1',port:integer('BACKEND_PORT',5300,1,65535),poolSize:integer('DB_POOL_SIZE',5,1,30)};}
