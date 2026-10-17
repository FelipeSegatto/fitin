import {test} from 'node:test';import assert from 'node:assert/strict';
import {createPersonalProduct,validateProductLabel,validBarcode,loadPersonalProducts,savePersonalProducts,productStorageKey} from '../src/personalProducts.ts';
const label={name:'Whey teste',brand:'Marca teste',barcode:'3017620422003',amount:30,unit:'g',nutrients:{kcal:120,protein:24,carbs:3,fat:1.5}};
test('label portions normalize once, preserve original and remain private/unverified',()=>{
 const p=createPersonalProduct(label,[],'test','2026-10-17T00:00:00Z');
 assert.deepEqual(p.food.per100,{kcal:400,protein:80,carbs:10,fat:5});
 assert.equal(p.label.amount,30);assert.equal(p.review.status,'not_submitted');assert.equal(p.food.source,'personal');
 assert.throws(()=>createPersonalProduct({...label,name:'Outra coisa',brand:'Outra marca'},[p]));
 assert.throws(()=>createPersonalProduct({...label,barcode:'3017620422004'},[]));
 assert.throws(()=>createPersonalProduct({...label,amount:0},[]));
 assert.throws(()=>createPersonalProduct({...label,nutrients:{...label.nutrients,protein:40}},[]));
 assert.equal(validBarcode(label.barcode),true);assert.equal(validBarcode('123'),false);
});
test('missing macros stay unknown; discrepancies warn without claiming verification',()=>{
 const missing=validateProductLabel({...label,nutrients:{...label.nutrients,protein:null}});
 assert.equal(missing.per100.protein,null);assert.ok(missing.warnings.length>0);
 const discrepancy=validateProductLabel({...label,nutrients:{kcal:120,protein:0,carbs:0,fat:0}});
 assert.equal(discrepancy.errors.length,0);assert.ok(discrepancy.warnings.some(w=>w.includes('divergem')));
});
test('storage survives reload, separates accounts and rebuilds normalized fields',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v)};
 const p=createPersonalProduct(label,[],'test');savePersonalProducts('joao@example.com',[p],storage);
 assert.equal(loadPersonalProducts('joao@example.com',storage).length,1);
 assert.equal(loadPersonalProducts('marina@example.com',storage).length,0);
 const raw=JSON.parse(map.get(productStorageKey('joao@example.com')));raw[0].food.per100.kcal=999;
 storage.setItem(productStorageKey('joao@example.com'),JSON.stringify(raw));
 assert.equal(loadPersonalProducts('joao@example.com',storage)[0].food.per100.kcal,400);
 storage.setItem(productStorageKey('joao@example.com'),'broken-json');
 assert.throws(()=>loadPersonalProducts('joao@example.com',storage));assert.equal(storage.getItem(productStorageKey('joao@example.com')),'broken-json');
});
