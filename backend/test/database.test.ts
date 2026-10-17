import {test,before,after,beforeEach,afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {Connection,RowDataPacket,ResultSetHeader} from 'mysql2/promise';
import {createAppPool,migrationConnection,withTransaction} from '../src/db/connection.ts';
import {migrate,migrationFiles} from '../src/db/migrations.ts';
import {seed} from '../scripts/seed.ts';
let connection:Connection;
const app=createAppPool();
before(async()=>{connection=await migrationConnection();});
after(async()=>{await connection?.end();await app.end();});
beforeEach(async()=>{await connection.beginTransaction();});
afterEach(async()=>{await connection.rollback();});
async function insert(sql:string,values:(string|number|null|Buffer)[]=[]){const [result]=await connection.execute<ResultSetHeader>(sql,values);return String(result.insertId);}
async function user(){const email=`test-${randomUUID()}@example.test`;return insert('INSERT INTO users (email,email_normalized,password_hash,display_name) VALUES (?,?,?,?)',[email,email,'test-only-not-an-auth-credential','Test']);}
async function record(userId:string,kind='food',request=randomUUID()){
 return insert("INSERT INTO records (user_id,kind,occurred_at,local_date,timezone,title,origin,client_request_id,create_payload_hash) VALUES (?,?,UTC_TIMESTAMP(6),'2026-10-17','America/Sao_Paulo','Test','manual',?,UNHEX(SHA2('test',256)))",[userId,kind,request]);
}
async function food(owner:string){
 const foodId=await insert("INSERT INTO foods (owner_user_id,visibility,kind,name) VALUES (?,'private','packaged_product','Test product')",[owner]);
 const [sources]=await connection.query<RowDataPacket[]>("SELECT id FROM data_sources WHERE code='personal'");
 const version=await insert("INSERT INTO food_versions (food_id,version_no,label_amount,label_unit,label_kcal,label_protein_g,source_id,verification_status,normalization_version,validation_version,validated_at) VALUES (?,1,30,'g',120,NULL,?,'unverified','v1','v1',UTC_TIMESTAMP(6))",[foodId,String(sources[0].id)]);
 return {foodId,version,sourceId:String(sources[0].id)};
}
function code(expected:string){return (error:unknown)=>typeof error==='object'&&error!==null&&'code' in error&&error.code===expected;}

test('actual MySQL 8.4 schema contains all 38 planned domain tables with enforced constraints',async()=>{
 const [v]=await connection.query<RowDataPacket[]>('SELECT VERSION() AS version');assert.match(v[0].version,/^8\.4\./);
 const files=await migrationFiles();assert.equal(files.length,38);
 const [tables]=await connection.query<RowDataPacket[]>("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_TYPE='BASE TABLE'");
 for(const file of files)assert(tables.some(t=>t.name===file.name.replace(/^\d+_/,'').replace(/\.sql$/,'')),file.name);
 const [constraints]=await connection.query<RowDataPacket[]>("SELECT CONSTRAINT_TYPE AS kind, COUNT(*) AS count FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() GROUP BY CONSTRAINT_TYPE");
 assert(Number(constraints.find(c=>c.kind==='FOREIGN KEY')?.count)>40);assert(Number(constraints.find(c=>c.kind==='CHECK')?.count)>100);
});

test('seeds and migrations can be repeated without duplicating references',async()=>{
 await connection.rollback();
 assert.equal((await migrate()).newlyApplied,0);await seed();await seed();
 const [counts]=await connection.query<RowDataPacket[]>(`SELECT (SELECT COUNT(*) FROM goal_types) AS goals,(SELECT COUNT(*) FROM foods WHERE visibility='public') AS foods,(SELECT COUNT(*) FROM activity_references) AS activities,(SELECT COUNT(*) FROM medals) AS medals`);
 assert.equal(Number(counts[0].goals),4);assert.equal(Number(counts[0].foods),591);assert.equal(Number(counts[0].activities),47);assert.equal(Number(counts[0].medals),36);
 await connection.beginTransaction();
});

test('private/public ownership, positive portions and missing nutrients are enforced',async()=>{
 const owner=await user();
 await assert.rejects(insert("INSERT INTO foods (visibility,kind,name) VALUES ('private','packaged_product','Invalid')"),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await assert.rejects(insert("INSERT INTO foods (owner_user_id,visibility,kind,name) VALUES (?,'public','packaged_product','Invalid')",[owner]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 const {version,foodId,sourceId}=await food(owner);
 const [rows]=await connection.execute<RowDataPacket[]>('SELECT kcal_per100,protein_per100_g,label_amount FROM food_versions WHERE id=?',[version]);
 assert.equal(rows[0].kcal_per100,'400.000000');assert.equal(rows[0].protein_per100_g,null);assert.equal(rows[0].label_amount,'30.0000');
 await assert.rejects(insert("INSERT INTO food_versions (food_id,version_no,label_amount,label_unit,label_kcal,source_id,verification_status,normalization_version,validation_version,validated_at) VALUES (?,2,0,'g',100,?,'unverified','v1','v1',UTC_TIMESTAMP(6))",[foodId,sourceId]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
});

test('record idempotency and typed sub-records reject duplicate requests and wrong kinds',async()=>{
 const owner=await user(),request=randomUUID();const id=await record(owner,'food',request);
 await assert.rejects(record(owner,'food',request),code('ER_DUP_ENTRY'));
 await assert.rejects(insert("INSERT INTO meal_records (record_id,meal_type) VALUES (999999999,'lunch')"),code('ER_NO_REFERENCED_ROW_2'));
 const activity=await record(owner,'activity');
 await assert.rejects(insert("INSERT INTO meal_records (record_id,meal_type) VALUES (?,'lunch')",[activity]),code('ER_NO_REFERENCED_ROW_2'));
 await insert("INSERT INTO meal_records (record_id,meal_type) VALUES (?,'lunch')",[id]);
 await assert.rejects(insert("INSERT INTO meal_items (meal_record_id,position,name_snapshot,kcal,calculation_method,calculation_version) VALUES (?,1,'Invalid',-1,'manual_totals','v1')",[id]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
});

test('meal snapshots survive new food versions and referenced versions cannot be deleted',async()=>{
 const owner=await user(),{foodId,version,sourceId}=await food(owner),id=await record(owner);
 await insert("INSERT INTO meal_records (record_id,meal_type) VALUES (?,'lunch')",[id]);
 await insert("INSERT INTO meal_items (meal_record_id,food_version_id,position,name_snapshot,quantity,unit,kcal,protein_g,calculation_method,calculation_version,provenance_snapshot) VALUES (?,?,1,'Original label',30,'g',120,NULL,'catalog_portion','v1',JSON_OBJECT('version','1'))",[id,version]);
 await insert("INSERT INTO food_versions (food_id,version_no,label_amount,label_unit,label_kcal,source_id,verification_status,normalization_version,validation_version,validated_at) VALUES (?,2,30,'g',150,?,'unverified','v1','v1',UTC_TIMESTAMP(6))",[foodId,sourceId]);
 const [items]=await connection.execute<RowDataPacket[]>('SELECT kcal,protein_g FROM meal_items WHERE meal_record_id=?',[id]);assert.equal(items[0].kcal,'120.0000');assert.equal(items[0].protein_g,null);
 await assert.rejects(connection.execute('DELETE FROM food_versions WHERE id=?',[version]),code('ER_ROW_IS_REFERENCED_2'));
});

test('active energy consistency and MET provenance are enforced',async()=>{
 const owner=await user(),id=await record(owner,'activity');
 await assert.rejects(insert("INSERT INTO activity_records (record_id,energy_origin,reported_kcal,reported_energy_kind,active_kcal) VALUES (?,'manual',200,'active',250)",[id]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await assert.rejects(insert("INSERT INTO activity_records (record_id,energy_origin,reported_kcal,reported_energy_kind,active_kcal) VALUES (?,'met',200,'active',200)",[id]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await insert("INSERT INTO activity_records (record_id,energy_origin,reported_kcal,reported_energy_kind,active_kcal) VALUES (?,'manual',200,'active',200)",[id]);
});

test('AI decisions cannot link another user record; pipeline inputs have real exclusive FKs',async()=>{
 const owner=await user(),other=await user(),otherRecord=await record(other);
 const request=await insert("INSERT INTO ai_requests (user_id,client_request_id,use_case,provider,model,prompt_version,output_schema_version,input_text,input_sha256,status,expires_at) VALUES (?,?,'food_parse','test','test','v1','v1','test',UNHEX(SHA2('test',256)),'pending',UTC_TIMESTAMP(6)+INTERVAL 1 DAY)",[owner,randomUUID()]);
 await assert.rejects(insert("INSERT INTO ai_decisions (ai_request_id,user_id,action,accepted_payload,created_record_id) VALUES (?,?,'accepted',JSON_OBJECT('test',1),?)",[request,owner,otherRecord]),code('ER_NO_REFERENCED_ROW_2'));
 await insert("INSERT INTO ai_decisions (ai_request_id,user_id,action) VALUES (?,?,'rejected')",[request,owner]);
 const job=await insert("INSERT INTO processing_jobs (job_type,idempotency_key,payload,available_at) VALUES ('test',?,JSON_OBJECT('test',1),UTC_TIMESTAMP(6))",[randomUUID()]);
 const run=await insert("INSERT INTO processing_runs (job_id,attempt_no,pipeline_version,input_sha256,status,started_at) VALUES (?,1,'v1',UNHEX(SHA2('test',256)),'running',UTC_TIMESTAMP(6))",[job]);
 await assert.rejects(insert('INSERT INTO processing_inputs (run_id) VALUES (?)',[run]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await assert.rejects(connection.execute("UPDATE processing_jobs SET status='running' WHERE id=?",[job]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
});

test('plan intervals, partial measurements and daily step uniqueness are enforced',async()=>{
 const owner=await user();const [goals]=await connection.query<RowDataPacket[]>("SELECT id FROM goal_types WHERE code='cutting'");
 await assert.rejects(insert("INSERT INTO user_plans (user_id,goal_type_id,valid_from,valid_until,daily_target_kcal,origin) VALUES (?,?,'2026-10-17','2026-10-16',2000,'manual')",[owner,String(goals[0].id)]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await assert.rejects(insert("INSERT INTO body_measurements (user_id,measured_at,local_date,timezone) VALUES (?,UTC_TIMESTAMP(6),'2026-10-17','America/Sao_Paulo')",[owner]),code('ER_CHECK_CONSTRAINT_VIOLATED'));
 await insert("INSERT INTO body_measurements (user_id,measured_at,local_date,timezone,weight_kg) VALUES (?,UTC_TIMESTAMP(6),'2026-10-17','America/Sao_Paulo',78)",[owner]);
 await insert("INSERT INTO daily_steps (user_id,local_date,timezone,steps,origin) VALUES (?,'2026-10-17','America/Sao_Paulo',5000,'manual')",[owner]);
 await assert.rejects(insert("INSERT INTO daily_steps (user_id,local_date,timezone,steps,origin) VALUES (?,'2026-10-17','America/Sao_Paulo',6000,'manual')",[owner]),code('ER_DUP_ENTRY'));
});

test('transaction failures leave no partial writes and app credentials have no DDL permission',async()=>{
 const email=`rollback-${randomUUID()}@example.test`;
 await assert.rejects(withTransaction(app,async c=>{await c.execute('INSERT INTO users (email,email_normalized,password_hash,display_name) VALUES (?,?,?,?)',[email,email,'test-only','Test']);throw new Error('Abort transaction');}),/Abort transaction/);
 const [rows]=await connection.execute<RowDataPacket[]>('SELECT id FROM users WHERE email_normalized=?',[email]);assert.equal(rows.length,0);
 await assert.rejects(app.query('CREATE TABLE __fitin_permission_probe (id INT)'),code('ER_TABLEACCESS_DENIED_ERROR'));
});
