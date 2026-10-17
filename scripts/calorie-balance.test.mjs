import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calorieBalance} from '../src/calorieBalance.ts';
test('Marina has food excess even when the exercise-adjusted balance reaches zero',()=>{
 assert.deepEqual(calorieBalance(2000,2400,400),{foodBalance:-400,netBalance:0,foodExcess:400});
 assert.deepEqual(calorieBalance(2000,2400,500),{foodBalance:-400,netBalance:-100,foodExcess:400});
 assert.deepEqual(calorieBalance(2000,2500,400),{foodBalance:-500,netBalance:100,foodExcess:500});
});
test('adjusted balance reacts to adding, editing and removing exercise',()=>{
 assert.equal(calorieBalance(2000,926,150).netBalance,-1224);
 assert.equal(calorieBalance(2000,926,273).netBalance,-1347);
 assert.equal(calorieBalance(2000,926,300).netBalance,-1374);
 assert.equal(calorieBalance(2000,926,0).netBalance,-1074);
});

const {calorieFeedback,resolveNutritionPlan,nutritionPlans} = await import('../src/nutritionPlans.ts');
test('plan feedback distinguishes desired deficit, planned surplus and maintenance',()=>{
 for(const plan of ['Emagrecer','Cutting']){
  assert.equal(calorieFeedback(plan,-100).tone,'good');
  assert.equal(calorieFeedback(plan,100).tone,'warning');
  assert.equal(calorieFeedback(plan,0).tone,'neutral');
 }
 assert.equal(calorieFeedback('Lean bulking',100).tone,'good');
 assert.equal(calorieFeedback('Lean bulking',-100).tone,'warning');
 assert.equal(calorieFeedback('Manutenção',0).tone,'good');
 assert.equal(calorieFeedback('Manutenção',100).tone,'warning');
 assert.equal(calorieFeedback('Manutenção',-100).tone,'warning');
 assert.equal(resolveNutritionPlan('Ganhar massa').name,'Lean bulking');
 assert.equal(resolveNutritionPlan('Manter peso').name,'Manutenção');
 assert.equal(nutritionPlans.length,4);
});
