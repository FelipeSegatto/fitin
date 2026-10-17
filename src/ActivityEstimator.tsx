import { useState } from "react";
import { Bike, ChevronDown } from "lucide-react";
import { activityOptions, activitySource, estimateActivity, type ActivityReference } from "./activities";
import "./activities.css";
export function ActivityEstimator({ defaultWeight, initial, onApply }: {
  defaultWeight?: number;
  initial?: ActivityReference;
  onApply: (reference: ActivityReference) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState(initial?.activityId || activityOptions[0].id);
  const [weight, setWeight] = useState(String(initial?.weightKg ?? defaultWeight ?? ""));
  const [minutes, setMinutes] = useState(String(initial?.minutes ?? 30));
  const activity = activityOptions.find(item => item.id === activityId)!;
  let estimate: ActivityReference | undefined;
  let error = "";
  try { estimate = estimateActivity(activityId, Number(weight), Number(minutes)); }
  catch (e) { error = (e as Error).message; }
  return <section className="activity-estimator">
    <button type="button" className="activity-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
      <Bike size={18} /> Estimar calorias da atividade <ChevronDown size={16} />
    </button>
    {open && <div className="activity-panel">
      <p>Escolha a modalidade e o ritmo. Você também pode informar as calorias do relógio ou aplicativo no formulário.</p>
      <label className="field"><span>Modalidade e ritmo</span><select value={activityId} onChange={e => setActivityId(e.target.value)}>
        {activityOptions.map(item => <option key={item.id} value={item.id}>{item.name} · {item.detail}</option>)}
      </select></label>
      <div className="activity-inputs">
        <label className="field"><span>Peso usado na estimativa (kg)</span><input type="number" min="20" max="350" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} /></label>
        <label className="field"><span>Tempo da atividade (min)</span><input type="number" min="1" max="1440" step="1" value={minutes} onChange={e => setMinutes(e.target.value)} /></label>
      </div>
      <p className="activity-intensity">Intensidade de referência: {activity.intensity.toLowerCase()} · {activity.met.toLocaleString("pt-BR")} MET</p>
      <div className="activity-estimate" role="status">
        {estimate ? <><strong>≈ {estimate.kcal.toLocaleString("pt-BR")} kcal ativas</strong><span>Estimativa para {estimate.minutes} min e {estimate.weightKg.toLocaleString("pt-BR")} kg.</span></> : <span>{error}</span>}
      </div>
      <button className="primary activity-apply" type="button" disabled={!estimate} onClick={() => { if (estimate) {onApply(estimate); setOpen(false);} }}>Usar estimativa</button>
      <small>Referência populacional; o gasto individual varia. Mostramos somente o gasto acima do repouso. Confira o peso antes de usar. <a href={activitySource.url} target="_blank" rel="noreferrer">Fonte dos METs</a>.</small>
    </div>}
  </section>;
}
