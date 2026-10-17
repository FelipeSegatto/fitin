import {pathToFileURL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import type {RowDataPacket,ResultSetHeader,ExecuteValues} from 'mysql2/promise';
import {migrationConnection} from '../src/db/connection.ts';
const file=new URL('../seeds/reference-v1.json',import.meta.url);
export async function seed(){
 const raw=await readFile(file,'utf8'),data=JSON.parse(raw),checksum=createHash('sha256').update(raw).digest('hex');
 const connection=await migrationConnection();let locked=false;
 const lockName=`fitin:seeds:${createHash('sha256').update(String(connection.config.database)).digest('hex').slice(0,32)}`;
 try{
  const [lock]=await connection.execute<RowDataPacket[]>('SELECT GET_LOCK(?,10) AS acquired',[lockName]);
  if(Number(lock[0].acquired)!==1)throw new Error('Another seed process holds the lock');locked=true;
  const [migrations]=await connection.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM schema_migrations WHERE applied_at IS NOT NULL');
  if(Number(migrations[0].count)!==38)throw new Error('Run all migrations before seeding');
  await connection.query(`CREATE TABLE IF NOT EXISTS schema_seeds (
   name VARCHAR(191) COLLATE utf8mb4_0900_bin PRIMARY KEY,
   checksum CHAR(64) COLLATE utf8mb4_0900_bin NOT NULL,
   applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci`);
  const [existing]=await connection.execute<RowDataPacket[]>('SELECT checksum FROM schema_seeds WHERE name=?',[data.version]);
  if(existing.length){if(existing[0].checksum!==checksum)throw new Error('Applied seed changed. Create a new version instead of editing it.');console.log('Reference seed already applied; no changes.');return;}
  await connection.beginTransaction();
  async function insert(sql:string,values:ExecuteValues){const [result]=await connection.execute<ResultSetHeader>(sql,values);return String(result.insertId);}
  async function id(table:string,code:string){const [rows]=await connection.execute<RowDataPacket[]>(`SELECT id FROM ${table} WHERE code=?`,[code]);if(rows.length!==1)throw new Error(`Missing reference in ${table}`);return String(rows[0].id);}
  const sources=[
   ['taco','TACO · NEPA/UNICAMP','reference_dataset','https://www.nepa.unicamp.br/taco/','https://www.nepa.unicamp.br/taco/','Attribution','TACO 4ª edição (2011). Reprodução permitida com citação da fonte; ver docs/nutrition-integration.md.'],
   ['off','Open Food Facts','external_api','https://world.openfoodfacts.org/','https://world.openfoodfacts.org/terms-of-use','ODbL','Não há importação de produtos OFF neste seed. Rever licença ao armazenar/redistribuir.'],
   ['usda','USDA FoodData Central','external_api','https://fdc.nal.usda.gov/','https://fdc.nal.usda.gov/api-guide.html',null,'Sem importação externa neste seed.'],
   ['personal','Rótulo pessoal','personal_label',null,null,null,'Informação fornecida pelo usuário, não verificada.'],
   ['fitin','Curadoria FitIn','fitin_curated',null,null,null,'Publicação exige evidência e revisão.'],
   ['met','Compêndio de Atividades Físicas','reference_dataset',data.activitySource.url,data.activitySource.url,null,'Referências factuais já selecionadas no aplicativo; equivalências são identificadas.']
  ];
  for(const source of sources)await insert('INSERT INTO data_sources (code,name,kind,base_url,terms_url,license_code,license_notes) VALUES (?,?,?,?,?,?,?)',source);
  for(const goal of [['weight_loss','Emagrecer',-1],['cutting','Cutting',-1],['maintenance','Manutenção',0],['lean_bulk','Lean bulking',1]])await insert('INSERT INTO goal_types (code,name,balance_direction) VALUES (?,?,?)',goal);
  let importedFoods=0;
  const tacoSource=await id('data_sources','taco'),metSource=await id('data_sources','met'),usdaSource=await id('data_sources','usda');
  const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)&&v>=0?String(v):null;
  for(const food of data.taco.foods){
   if(number(food.kcal)===null)continue;
   importedFoods++;
   const sourceRecord=await insert('INSERT INTO source_records (source_id,external_id,source_url,first_seen_at,last_seen_at) VALUES (?,?,?,UTC_TIMESTAMP(6),UTC_TIMESTAMP(6))',[tacoSource,String(food.id),'https://www.nepa.unicamp.br/taco/']);
   const payload=JSON.stringify(food);
   const snapshot=await insert('INSERT INTO source_snapshots (source_record_id,fetched_at,upstream_version,payload_sha256,payload_json) VALUES (?,UTC_TIMESTAMP(6),?,UNHEX(?),?)',[sourceRecord,data.taco.version,createHash('sha256').update(payload).digest('hex'),payload]);
   const foodId=await insert("INSERT INTO foods (visibility,kind,name) VALUES ('public','generic_food',?)",[food.name]);
   await insert("INSERT INTO food_versions (food_id,version_no,label_amount,label_unit,label_kcal,label_protein_g,label_carbs_g,label_fat_g,source_snapshot_id,source_id,verification_status,normalization_version,validation_version,validated_at) VALUES (?,1,100,'g',?,?,?,?,?,?,'source_imported','per100-v1','taco-import-v1',UTC_TIMESTAMP(6))",[foodId,number(food.kcal),number(food.protein),number(food.carbs),number(food.fat),snapshot,tacoSource]);
  }
  const intensity:Record<string,string>={'Leve':'light','Moderada':'moderate','Vigorosa':'vigorous'};
  const typeIds=new Map<string,string>();
  for(const activity of data.activities){
   if(!typeIds.has(activity.name))typeIds.set(activity.name,await insert('INSERT INTO activity_types (code,name,category) VALUES (?,?,?)',[activity.id,activity.name,activity.category]));
   await insert('INSERT INTO activity_references (activity_type_id,reference_code,version_no,description,intensity,met,is_approximation,approximation_note,source_id,source_version,source_url) VALUES (?,?,1,?,?,?,?,?,?,?,?)',[typeIds.get(activity.name),activity.id,activity.detail,intensity[activity.intensity],String(activity.met),activity.referenceNote?1:0,activity.referenceNote||null,metSource,data.activitySource.version,data.activitySource.url]);
  }
  const designs=new Map<string,string>(),medals=new Map<string,string>();
  for(const medal of data.medals){
   const code=`${medal.kind}-${medal.finish}`;
   if(!designs.has(code)){
    const asset=medal.kind==='medallion'?`/assets/achievements/medallion-${medal.finish}.png`:`/assets/medal-${medal.finish}.${['pink','green'].includes(medal.finish)?'png':'svg'}`;
    designs.set(code,await insert('INSERT INTO medal_designs (code,kind,finish,asset_key) VALUES (?,?,?,?)',[code,medal.kind,medal.finish,asset]));
   }
   const medalId=await insert('INSERT INTO medals (code,version_no,design_id,name,description,background_token,xp_reward) VALUES (?,1,?,?,?,?,?)',[medal.code,designs.get(code),medal.name,medal.description,medal.background,medal.xp]);medals.set(medal.name,medalId);
   await insert("INSERT INTO medal_rules (medal_id,position,metric_code,target_value,window_kind) VALUES (?,1,?,?,'lifetime')",[medalId,medal.metric,String(medal.target)]);
  }
  const challengeMetrics:Record<string,string>={meals:'meal_days',activities:'activity_count',weight:'weight_measurement_count',days:'record_days'};
  for(const challenge of data.challenges)await insert('INSERT INTO challenges (code,version_no,name,description,metric_code,target_value,reward_medal_id,background_token) VALUES (?,1,?,?,?,?,?,?)',[challenge.id,challenge.name,challenge.description,challengeMetrics[challenge.id],String(challenge.target),medals.get(challenge.reward)||null,challenge.color]);
  const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  for(const [kind,entries] of [['food',data.equivalences.foods],['modifier',data.equivalences.modifiers]] as const)
   for(const entry of entries)for(const term of entry.pt)await insert("INSERT INTO search_equivalences (source_language,target_language,term_normalized,translated_term,qualifier,target_source_id) VALUES ('pt-BR','en',?,?,?,?)",[normalize(term),entry.en,kind,usdaSource]);
  await connection.execute('INSERT INTO schema_seeds (name,checksum) VALUES (?,?)',[data.version,checksum]);
  await connection.commit();console.log(`Reference seed applied: ${importedFoods} TACO foods (${data.taco.foods.length-importedFoods} without usable energy skipped), ${data.activities.length} activity references, ${data.medals.length} medals, ${data.challenges.length} challenges. No user accounts or unverified branded foods were created.`);
 }catch(error){await connection.rollback();throw error;}
 finally{if(locked)await connection.execute('SELECT RELEASE_LOCK(?)',[lockName]);await connection.end();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 try{await seed();}catch(error){console.error(error instanceof Error?error.message:'Seed failed');process.exitCode=1;}
}
