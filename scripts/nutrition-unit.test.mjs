import { test } from 'node:test';
import assert from 'node:assert/strict';
import { numberOrNull, normalizeOff, normalizeUsda } from '../server/nutrition/normalize.mjs';
import { createProviders } from '../server/nutrition/providers.mjs';
import { createNutritionService, createNutritionHandler } from '../server/nutrition/service.mjs';
import { parseFoodQuery, portionValues } from '../src/nutrition.ts';

test('unknown values remain unknown; real zero is retained', () => {
  for (const input of [null, undefined, '', ' ', 'Tr', 'NA', false, -1, Infinity]) assert.equal(numberOrNull(input), null);
  assert.equal(numberOrNull('0'), 0);
  assert.equal(numberOrNull('2,5'), 2.5);
});
test('OFF normalizes energy, liquid basis and unknown macros', () => {
  const food = normalizeOff({code:'12345678', product_name:'Leite',quantity:'1 l',nutriments:{energy_100g:418.4,proteins_100g:0}});
  assert.ok(Math.abs(food.per100.kcal-100)<1e-9);
  assert.equal(food.basis.unit,'ml');
  assert.equal(food.per100.protein,0);
  assert.equal(food.per100.fat,null);
  assert.equal(normalizeOff({product_name:'sem identificador',nutriments:{'energy-kcal_100g':100}}),null);
  assert.equal(normalizeOff({code:'1',product_name:'Teste',nutriments:{energy_100g:100,energy_unit:'kcal'}}).per100.kcal,100);
});
test('USDA uses nutrient IDs and verifies nutrient units', () => {
  const food = normalizeUsda({fdcId:123, description:'Rice',brandOwner:'Test brand',foodNutrients:[{nutrientId:1008,unitName:'KCAL',value:130},{nutrientId:1003,unitName:'G',value:2.5},{nutrientId:1004,unitName:'MG',value:99}]});
  assert.equal(food.name,'Rice · Test brand');
  assert.deepEqual(food.per100,{kcal:130,protein:2.5,carbs:null,fat:null});
});
test('real TACO data calculates an explicit portion and retains attribution', async () => {
  const foods = await createProviders().taco.search('arroz cozido');
  const food = foods.find(f=>f.sourceId==='3');
  assert.deepEqual(portionValues(food,150),{kcal:192,protein:3.8,carbs:42.1,fat:0.3});
  assert.equal(food.sourceVersion,'TACO 4ª edição, 2011');
  assert.deepEqual(parseFoodQuery('0,15 kg de arroz cozido'),{query:'arroz cozido',amount:150,unit:'g'});
  assert.equal(parseFoodQuery('150 g arroz e 100 g feijão').error?.includes('um alimento'),true);
  assert.equal(parseFoodQuery('um prato de arroz').amount,undefined);
  assert.throws(()=>portionValues(food,0));
});
test('external adapters construct fixed provider URLs; never expose USDA key', async () => {
  const urls=[];
  const providers=createProviders({usdaKey:'test-only-secret',fetchImpl:async url=>{
    urls.push(new URL(url));
    return {ok:true,status:200,json:async()=>url.hostname==='world.openfoodfacts.org'?{status:1,code:'12345678',product:{product_name:'Teste',nutriments:{'energy-kcal_100g':0}}}:{foods:[]}};
  }});
  assert.equal((await providers.off.search('12345678'))[0].sourceId,'12345678');
  assert.deepEqual(await providers.usda.search('rice'),[]);
  assert.equal(urls[1].searchParams.get('api_key'),'test-only-secret');
  assert.equal(urls[1].searchParams.get('dataType'),'Foundation,SR Legacy,Branded');
});
test('cache, coalescing, source cooldown, expiry and failed requests', async () => {
  let now=10000,calls=0;
  const provider={mode:'test',search:async()=>{calls++;return [];}};
  const search=createNutritionService({providers:{taco:provider,off:provider,usda:provider},clock:()=>now});
  await Promise.all([search('off','rice'),search('off','rice')]);
  assert.equal(calls,1);
  assert.equal((await search('off','rice')).cached,true);
  await assert.rejects(search('off','beans'),e=>e.status===429);
  await search('usda','rice');
  assert.equal(calls,2);
  now+=600001;
  assert.equal((await search('off','rice')).cached,false);
  await assert.rejects(search('__proto__','rice'),e=>e.status===400);
  await assert.rejects(search('taco','x'),e=>e.status===400);
  let fail=true;
  const retry=createNutritionService({providers:{taco:{search:async()=>{if(fail)throw Error('offline');return [];}}}});
  await assert.rejects(retry('taco','rice'));
  fail=false;
  assert.equal((await retry('taco','rice')).cached,false);
});
test('HTTP handler rejects methods and sanitizes unexpected errors', async () => {
  const handler=createNutritionHandler({providers:{taco:{search:async()=>{throw Error('private-key');}}}});
  const invoke=async method=>{const res={setHeader(){},end(body){this.body=JSON.parse(body);}};await handler({method,url:'/?q=rice'},res);return res;};
  assert.equal((await invoke('POST')).statusCode,405);
  const result=await invoke('GET');
  assert.equal(result.statusCode,503);
  assert.equal(JSON.stringify(result.body).includes('private-key'),false);
});
