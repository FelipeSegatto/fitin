import catalog from './data/equivalences.json' with {type:'json'};
import {textKey} from './normalize.mjs';
const key = text => textKey(text).replace(/[-,]/g,' ').replace(/\s+/g,' ').trim();
const aliases = entries => entries.flatMap(entry => [...entry.pt,entry.en].map(alias=>({key:key(alias),en:entry.en}))).sort((a,b)=>b.key.length-a.key.length);
const foods = aliases(catalog.foods), modifiers = aliases(catalog.modifiers);
export const equivalenceVersion = catalog.version;
export function resolveUsdaQuery(input) {
  const query = key(input);
  // This phrase can mean fresh meat or a processed cold cut.
  if (query === 'peito de peru') return {status:'ambiguous',version:catalog.version,message:'Especifique peito de peru cru ou defumado para consultar o USDA.'};
  const exact = foods.find(item=>item.key===query);
  if(exact) return {status:'matched',query:exact.en,version:catalog.version};
  for(const food of foods) {
    if(!(` ${query} `).includes(` ${food.key} `)) continue;
    let rest = (` ${query} `).replace(` ${food.key} `,' ').trim();
    const translated=[];
    while(rest) {
      const modifier=modifiers.find(item=>rest===item.key || rest.startsWith(`${item.key} `));
      if(!modifier) break;
      translated.push(modifier.en);
      rest=rest.slice(modifier.key.length).trim();
    }
    if(!rest) return {status:'matched',query:[...translated,food.en].join(' '),version:catalog.version};
  }
  return {status:'missing',version:catalog.version,message:'Sem equivalência no catálogo para o USDA. As outras fontes continuam disponíveis; você também pode pesquisar em inglês no filtro USDA.'};
}
