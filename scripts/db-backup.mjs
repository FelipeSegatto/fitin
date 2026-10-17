import {mkdir,rename,rm,createWriteStream} from 'node:fs';
import {promisify} from 'node:util';
import {spawn} from 'node:child_process';
import {finished} from 'node:stream/promises';
import {resolve} from 'node:path';
const root=new URL('../',import.meta.url);
const output=resolve(process.argv[2]||`backups/fitin-${new Date().toISOString().replaceAll(':','-')}.sql`);
const temporary=output+'.partial';
await promisify(mkdir)(resolve(output,'..'),{recursive:true});
const stream=createWriteStream(temporary,{flags:'wx',mode:0o600});
const child=spawn('docker',['compose','exec','-T','mysql','sh','-c','MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --quick --no-tablespaces --set-gtid-purged=OFF --databases "$MYSQL_DATABASE"'],{cwd:root,stdio:['ignore','pipe','inherit']});
child.stdout.pipe(stream);
try{
 await Promise.all([finished(stream),new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',(code)=>code===0?resolve():reject(new Error(`mysqldump exited with ${code}`)));})]);
 await promisify(rename)(temporary,output);console.log(`Backup saved: ${output}`);
}catch(error){child.kill();stream.destroy();await promisify(rm)(temporary,{force:true});console.error(error.message);process.exitCode=1;}
