import { recordId } from './records.ts';
import type { FoodCandidate, NutrientKey } from './nutrition';
export type ProductLabel = {
  name: string; brand: string; barcode: string;
  amount: number; unit: 'g'|'ml';
  nutrients: Record<NutrientKey, number|null>;
};
export type PersonalProduct = {
  schemaVersion: 1; id: string; label: ProductLabel; food: FoodCandidate;
  createdAt: string; updatedAt: string;
  integrity: {version: 'label-v1'; warnings: string[]};
  review: {status:'not_submitted'};
};
const clean = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function validBarcode(code: string) {
  if(!/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(code)) return false;
  const digits=code.split('').map(Number); const check=digits.pop()!;
  const sum=digits.reverse().reduce((sum,n,i)=>sum+n*(i%2===0?3:1),0);
  return (10-sum%10)%10===check;
}
export function validateProductLabel(value: unknown): {errors:string[]; warnings:string[]; label?:ProductLabel; per100?:Record<NutrientKey,number|null>} {
  const errors:string[]=[],warnings:string[]=[];
  if(!value || typeof value!=='object') return {errors:['Preencha os dados do rótulo.'],warnings};
  const input=value as ProductLabel;
  const name=typeof input.name==='string'?input.name.trim():'';
  const brand=typeof input.brand==='string'?input.brand.trim():'';
  const barcode=typeof input.barcode==='string'?input.barcode.trim():'';
  if(name.length<2 || name.length>80) errors.push('Nome deve ter entre 2 e 80 caracteres.');
  if(brand.length<2 || brand.length>80) errors.push('Informe a marca, com até 80 caracteres.');
  if(barcode && !validBarcode(barcode)) errors.push('Confira o código de barras e seu dígito verificador (8, 12, 13 ou 14 dígitos).');
  if(input.unit!=='g' && input.unit!=='ml') errors.push('Escolha g ou ml.');
  if(!Number.isFinite(input.amount) || input.amount<=0 || input.amount>5000) errors.push('Informe a quantidade de referência do rótulo, maior que zero e até 5.000.');
  const nutrients={} as Record<NutrientKey,number|null>;
  for(const key of ['kcal','protein','carbs','fat'] as const) {
    const n=input.nutrients?.[key];
    if(n===null && key!=='kcal') nutrients[key]=null;
    else if(typeof n!=='number' || !Number.isFinite(n) || n<0) errors.push('Calorias são obrigatórias; nutrientes devem ser números não negativos ou ficar sem informação.');
    else nutrients[key]=n;
  }
  if(errors.length) return {errors:[...new Set(errors)],warnings};
  const per100=Object.fromEntries(Object.entries(nutrients).map(([k,v])=>[k,v===null?null:Math.round(v/input.amount*100*10000)/10000])) as Record<NutrientKey,number|null>;
  if(per100.kcal!>1000) errors.push('Calorias por 100 g/ml acima do limite esperado. Confira a porção do rótulo.');
  const max=input.unit==='g'?100.5:150;
  if(['protein','carbs','fat'].some(k=>(per100[k as NutrientKey]??0)>max)) errors.push('Confira macros e quantidade de referência: valores acima do limite esperado.');
  const macros=[per100.protein,per100.carbs,per100.fat];
  if(macros.every(n=>n!==null)) {
    if(input.unit==='g' && macros.reduce((s,n)=>s+n!,0)>101) errors.push('A soma dos macros ultrapassa 100 g por 100 g de produto.');
    const estimated=per100.protein!*4+per100.carbs!*4+per100.fat!*9;
    if(Math.abs(estimated-per100.kcal!)>Math.max(50,per100.kcal!*0.2)) warnings.push('Energia e macros divergem na checagem aproximada. Confira o rótulo; fibras e polióis também podem explicar diferenças.');
  } else warnings.push('Há macros sem informação. Eles permanecerão desconhecidos, sem virar zero.');
  if(!barcode) warnings.push('Sem código de barras: a identificação depende de nome e marca.');
  return {errors,warnings,label:{name,brand,barcode,amount:input.amount,unit:input.unit,nutrients},per100};
}
export function createPersonalProduct(label: ProductLabel, existing: PersonalProduct[], id=recordId(), now=new Date().toISOString()): PersonalProduct {
  const result=validateProductLabel(label);
  if(result.errors.length || !result.label || !result.per100) throw new Error(result.errors.join(' '));
  if(existing.some(p=>result.label!.barcode && p.label.barcode===result.label!.barcode || clean(p.label.name)===clean(label.name) && clean(p.label.brand)===clean(label.brand))) throw new Error('Este produto já está nos seus produtos. Use o cadastro existente.');
  return {schemaVersion:1,id,label:result.label,createdAt:now,updatedAt:now,integrity:{version:'label-v1',warnings:result.warnings},review:{status:'not_submitted'},
    food:{id:`personal:${id}`,sourceId:id,source:'personal',name:`${result.label.name} · ${result.label.brand}`,brand:result.label.brand,barcode:result.label.barcode,
      sourceName:'Meu produto · rótulo informado',sourceUrl:'',sourceVersion:'Rótulo pessoal · v1',basis:{amount:100,unit:label.unit},per100:result.per100,qualifiers:{}}};
}
export function productStorageKey(account: string) {return `fitin.personal-products.v1:${encodeURIComponent(account.trim().toLowerCase())}`;}
export function loadPersonalProducts(account: string, storage: Pick<Storage,'getItem'>=localStorage): PersonalProduct[] {
  const raw=storage.getItem(productStorageKey(account));
  if(!raw) return [];
  const data=JSON.parse(raw);
  if(!Array.isArray(data) || data.length>200) throw new Error('O catálogo salvo precisa ser recuperado. Não foi sobrescrito.');
  // Rebuild trusted normalized data; never trust edited localStorage nutrient values or URLs.
  return data.map(p=>{
    if(p.schemaVersion!==1 || typeof p.id!=='string' || typeof p.createdAt!=='string') throw new Error('Um produto salvo está inválido.');
    return createPersonalProduct(p.label,[],p.id,p.createdAt);
  });
}
export function savePersonalProducts(account: string, products: PersonalProduct[], storage: Pick<Storage,'setItem'>=localStorage) {
  if(products.length>200) throw new Error('Limite de 200 produtos pessoais nesta demo.');
  storage.setItem(productStorageKey(account),JSON.stringify(products));
}
export function findPersonalProducts(account: string, query: string) {
  const words=clean(query).split(/\s+/);
  return loadPersonalProducts(account).filter(p=>words.every(w=>clean(`${p.label.name} ${p.label.brand} ${p.label.barcode}`).includes(w))).slice(0,8).map(p=>p.food);
}
