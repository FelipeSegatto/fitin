import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateActivity,weightAtDate,activityOptions} from '../src/activities.ts';
test('active estimate subtracts resting energy and preserves parameters and reference',()=>{
 const result=estimateActivity('cycling-leisure',78,30);
 assert.equal(result.kcal,123);
 assert.equal(result.met,4);
 assert.equal(result.minutes,30);
 assert.equal(result.weightKg,78);
 assert.equal(result.method,'net-met-v1');
 assert.equal(result.source.version,'2011');
 assert.equal(estimateActivity('cycling-leisure',78,60).kcal,246);
 assert.ok(estimateActivity('cycling-fast',78,30).kcal>result.kcal);
});
test('estimates require explicit valid weight, duration and an existing reference',()=>{
 for(const [id,w,m] of [['missing',78,30],['cycling-leisure',0,30],['cycling-leisure',NaN,30],['cycling-leisure',78,0],['cycling-leisure',78,1441],['cycling-fast',350,1440]])
  assert.throws(()=>estimateActivity(id,w,m));
 assert.equal(new Set(activityOptions.map(a=>a.id)).size,activityOptions.length);
});
test('weight suggestions never use a future measurement and preserve original history',()=>{
 const weights=[{date:'2026-10-17',weight:78},{date:'2026-10-01',weight:80},{date:'2026-10-20',weight:75}];
 const snapshot=JSON.stringify(weights);
 assert.equal(weightAtDate(weights,'2026-10-16'),80);
 assert.equal(weightAtDate(weights,'2026-10-17'),78);
 assert.equal(weightAtDate(weights,'2026-09-01'),undefined);
 assert.equal(JSON.stringify(weights),snapshot);
});

test('CrossFit retains its approximation reference and effort levels differ',()=>{
 const moderate=estimateActivity('crossfit-moderate',78,30);
 const vigorous=estimateActivity('crossfit-vigorous',78,30);
 assert.ok(vigorous.kcal>moderate.kcal);
 assert.ok(vigorous.referenceNote.includes('não um MET específico de CrossFit'));
});
