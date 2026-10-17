import { useState } from "react";
import { Bike, ChevronDown, Search, Footprints, Dumbbell, Waves, Music2, Trophy, PersonStanding, Clock3, HeartPulse } from "lucide-react";
import { activityOptions, activityCategories, activityCategory, activitySource, estimateActivity, type ActivityReference } from "./activities";
import "./activities.css";
const icons = {Cardio:Footprints,Força:Dumbbell,Mobilidade:PersonStanding,Aquáticas:Waves,Esportes:Trophy,Dança:Music2};
function activityIcon(id: string) {
  if (id.startsWith("cycling")) return Bike;
  if (id === "rowing") return Waves;
  if (id === "elliptical" || id === "rope") return HeartPulse;
  return icons[activityCategory(id) as keyof typeof icons] || Footprints;
}
export function ActivityEstimator({ defaultWeight, initial, onApply }: {
  defaultWeight?: number; initial?: ActivityReference; onApply: (reference: ActivityReference) => void;
}) {
  const [open,setOpen]=useState(false),[query,setQuery]=useState(''),[category,setCategory]=useState('Todas');
  const [activityId,setActivityId]=useState(initial?.activityId||activityOptions[0].id);
  const [weight,setWeight]=useState(String(initial?.weightKg??defaultWeight??''));
  const [minutes,setMinutes]=useState(String(initial?.minutes??30));
  const activity=activityOptions.find(item=>item.id===activityId)!;
  const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const filtered=activityOptions.filter(item=>(category==='Todas'||activityCategory(item.id)===category)&&normalize(`${item.name} ${item.detail}`).includes(normalize(query)));
  let estimate:ActivityReference|undefined,error='';
  try{estimate=estimateActivity(activityId,Number(weight),Number(minutes));}catch(e){error=(e as Error).message;}
  const SelectedIcon=activityIcon(activityId);
  return <section className="activity-estimator">
    <button type="button" className="activity-toggle" aria-expanded={open} onClick={()=>setOpen(!open)}><Bike size={18}/> Estimar calorias da atividade <ChevronDown size={16}/></button>
    {open && <div className="activity-panel">
      <div className="activity-heading"><span className="activity-heading-icon"><HeartPulse size={22}/></span><div><h3>Qual foi o movimento de hoje?</h3><p>Escolha a atividade e o ritmo mais próximo do seu.</p></div></div>
      <label className="field activity-search"><span>Buscar atividade</span><div><Search size={16}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Caminhada, natação, pilates…" onKeyDown={e=>{if(e.key==='Enter')e.preventDefault();}}/></div></label>
      <div className="activity-categories" role="group" aria-label="Categorias de atividade">{activityCategories.map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      <p className="activity-result-count">{filtered.length} opções · selecione modalidade e ritmo</p>
      <div className="activity-options" role="group" aria-label="Modalidade e ritmo">{filtered.map(item=>{
        const group=activityCategory(item.id), Icon=activityIcon(item.id);
        return <button type="button" key={item.id} aria-label={`${item.name} · ${item.detail}`} aria-pressed={activityId===item.id} onClick={()=>setActivityId(item.id)}><span className={`activity-option-icon activity-color-${group}`}><Icon size={20}/></span><span><strong>{item.name}</strong><small>{item.detail}</small><em>{item.intensity}</em></span></button>;
      })}{!filtered.length&&<p>Nenhuma atividade encontrada. Tente outro termo ou informe os dados manualmente.</p>}</div>
      <div className="activity-selected"><SelectedIcon size={22}/><div><strong>{activity.name}</strong><span>{activity.detail}</span></div><small>Selecionada</small></div>
      <div className="activity-inputs">
        <label className="field"><span>Peso usado na estimativa (kg)</span><input type="number" min="20" max="350" step="0.1" value={weight} onChange={e=>setWeight(e.target.value)}/></label>
        <label className="field"><span>Tempo da atividade (min)</span><input type="number" min="1" max="1440" step="1" value={minutes} onChange={e=>setMinutes(e.target.value)}/></label>
      </div>
      <div className="activity-time-presets" role="group" aria-label="Durações rápidas"><Clock3 size={15}/>{[15,30,45,60].map(time=><button type="button" key={time} aria-label={`Definir duração de ${time} minutos`} aria-pressed={Number(minutes)===time} onClick={()=>setMinutes(String(time))}>{time} min</button>)}</div>
      <div className="activity-estimate" role="status">{estimate?<><span>Gasto ativo estimado</span><strong>≈ {estimate.kcal.toLocaleString('pt-BR')} kcal ativas</strong><span>{estimate.minutes} min · {estimate.weightKg.toLocaleString('pt-BR')} kg · {activity.intensity.toLowerCase()}</span></>:<span>{error}</span>}</div>
      <button className="primary activity-apply" type="button" disabled={!estimate} onClick={()=>{if(estimate){onApply(estimate);setOpen(false);}}}>Usar estimativa</button>
      <small>Estimativa populacional, acima do repouso. Confira peso e ritmo. Você pode usar as calorias ativas do relógio/app no formulário. <a href={activitySource.url} target="_blank" rel="noreferrer">Referência dos METs</a>.</small>
    </div>}
  </section>;
}
