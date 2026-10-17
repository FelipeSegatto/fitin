export const nutritionPlans = [
  {name:'Emagrecer',direction:-1,description:'Foco em perda de peso e déficit calórico',color:'mint'},
  {name:'Cutting',direction:-1,description:'Déficit calórico; mesma regra de Emagrecer nesta versão',color:'purple'},
  {name:'Manutenção',direction:0,description:'Foco em equilíbrio e manutenção do peso',color:'yellow'},
  {name:'Lean bulking',direction:1,description:'Foco em ganho de massa com superávit planejado',color:'blue'},
] as const;
export function resolveNutritionPlan(name: string) {
  const canonical = name === 'Ganhar massa' ? 'Lean bulking' : name === 'Manter peso' ? 'Manutenção' : name;
  return nutritionPlans.find(plan=>plan.name===canonical) || nutritionPlans[0];
}
export function calorieFeedback(planName:string, balance:number) {
  const plan=resolveNutritionPlan(planName);
  const direction=Math.sign(balance);
  return {
    label: direction<0 ? 'déficit' : direction>0 ? 'superávit' : 'equilíbrio',
    tone: direction===0 ? (plan.direction===0 ? 'good' : 'neutral') : direction===plan.direction ? 'good' : 'warning',
    consumptionTone: plan.direction < 0 ? 'warning' : plan.direction > 0 ? 'good' : 'neutral',
    activityTone: plan.direction < 0 ? 'good' : plan.direction > 0 ? 'warning' : 'neutral',
    plan:plan.name,
  } as const;
}
