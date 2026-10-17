import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calorieBalance} from '../src/calorieBalance.ts';
test('Marina has food excess even when the exercise-adjusted balance reaches zero',()=>{
 assert.deepEqual(calorieBalance(2000,2400,400),{foodBalance:-400,adjustedBalance:0,foodExcess:400});
 assert.deepEqual(calorieBalance(2000,2400,500),{foodBalance:-400,adjustedBalance:100,foodExcess:400});
 assert.deepEqual(calorieBalance(2000,2500,400),{foodBalance:-500,adjustedBalance:-100,foodExcess:500});
});
test('adjusted balance reacts to adding, editing and removing exercise',()=>{
 assert.equal(calorieBalance(2000,926,150).adjustedBalance,1224);
 assert.equal(calorieBalance(2000,926,273).adjustedBalance,1347);
 assert.equal(calorieBalance(2000,926,300).adjustedBalance,1374);
 assert.equal(calorieBalance(2000,926,0).adjustedBalance,1074);
});
