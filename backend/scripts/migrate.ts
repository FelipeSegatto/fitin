import {migrate} from '../src/db/migrations.ts';
try{const result=await migrate(process.argv.includes('--status'));console.log(JSON.stringify(result));}
catch(error){console.error(error instanceof Error?error.message:'Migration failed');process.exitCode=1;}
