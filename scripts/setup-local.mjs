import {randomBytes} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
const url=new URL('../.env',import.meta.url);
const raw=existsSync(url)?readFileSync(url,'utf8'):'';
const current=parseEnv(raw);
const defaults={MYSQL_DATABASE:'fitin',DB_HOST:'127.0.0.1',DB_PORT:'3307',DB_POOL_SIZE:'5',BACKEND_HOST:'127.0.0.1',BACKEND_PORT:'5300'};
const passwords=['MYSQL_ROOT_PASSWORD','MYSQL_APP_PASSWORD','MYSQL_MIGRATION_PASSWORD'];
const additions={};
for(const [key,value] of Object.entries(defaults))if(!current[key])additions[key]=value;
for(const key of passwords)if(!current[key])additions[key]=randomBytes(24).toString('hex');
// Preserve comments and existing settings; the last definition supplies a previously blank value.
if(Object.keys(additions).length)writeFileSync(url,raw+'\n# Local database settings\n'+Object.entries(additions).map(([k,v])=>`${k}=${v}`).join('\n')+'\n',{mode:0o600});
console.log('Local configuration ready. Existing nonempty settings were preserved.');
for(const [key,value] of Object.entries(additions))if(passwords.includes(key))console.log(`NEW LOCAL PASSWORD — ${key}: ${value}`);
console.log('Passwords stay in the ignored .env file. Nothing was started. Review credentials before docker compose up.');
