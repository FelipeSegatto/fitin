import { useState } from "react";
import { ArrowRight, CheckCircle2, Plus, TrendingUp } from "lucide-react";
import { type DailyRecord, localDay } from "./records";
import "./progress.css";
export type WeightRecord = { date: string; weight: number };
export type StepRecord = { date: string; steps: number };
type Props = {
  initialAction?: "weight" | "goal" | "history";
  weights: WeightRecord[];
  steps: StepRecord[];
  foods: DailyRecord[];
  workouts: DailyRecord[];
  target: number;
  goal: string;
  rate: number;
  weightGoal: string;
  onWeight: (date: string, value: number) => void;
  onSteps: (date: string, value: number) => void;
  onGoal: (value: string) => void;
};
export function Progress({
  initialAction,
  weights,
  steps,
  foods,
  workouts,
  target,
  goal,
  rate,
  weightGoal,
  onWeight,
  onSteps,
  onGoal,
}: Props) {
  const [view, setView] = useState(
      initialAction === "history" ? "Histórico" : "Resumo",
    ),
    [period, setPeriod] = useState(7),
    [editor, setEditor] = useState(
      initialAction === "weight" || initialAction === "goal"
        ? initialAction
        : "",
    ),
    [value, setValue] = useState(initialAction === "goal" ? weightGoal : ""),
    [date, setDate] = useState(localDay());
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
  const current = sorted.at(-1),
    first = sorted[0],
    goalWeight = weightGoal ? Number(weightGoal) : null;
  const since = new Date();
  since.setDate(since.getDate() - (period - 1));
  const sinceKey = localDay(since),
    now = localDay();
  const windowFoods = foods.filter((e) => e.date >= sinceKey && e.date <= now),
    windowWorkouts = workouts.filter(
      (e) => e.date >= sinceKey && e.date <= now,
    ),
    windowSteps = steps.filter((e) => e.date >= sinceKey && e.date <= now);
  const foodDays = new Set(windowFoods.map((e) => e.date)),
    recordDays = new Set(
      [...windowFoods, ...windowWorkouts].map((e) => e.date),
    );
  const avgCalories = foodDays.size
      ? Math.round(windowFoods.reduce((s, e) => s + e.kcal, 0) / foodDays.size)
      : null,
    avgSteps = windowSteps.length
      ? Math.round(
          windowSteps.reduce((s, e) => s + e.steps, 0) / windowSteps.length,
        )
      : null;
  const before = [...sorted].reverse().find((e) => e.date < sinceKey),
    weightWindow = sorted.filter((e) => e.date >= sinceKey),
    delta =
      current && (before || weightWindow[0])
        ? current.weight - (before || weightWindow[0]).weight
        : null;
  const percent =
    current && first && goalWeight !== null
      ? Math.max(
          0,
          Math.min(
            100,
            (first.weight === goalWeight
              ? current.weight === goalWeight
                ? 1
                : 0
              : (first.weight - current.weight) / (first.weight - goalWeight)) *
              100,
          ),
        )
      : null;
  const weeksLeft =
    current && goalWeight !== null && goal !== "Manutenção" && rate > 0
      ? Math.ceil(Math.abs(current.weight - goalWeight) / rate)
      : null;
  const finish = new Date();
  if (weeksLeft !== null) finish.setDate(finish.getDate() + weeksLeft * 7);
  const priorMonth = new Date();
  priorMonth.setDate(0);
  const prior = sorted
    .filter((e) => e.date.slice(0, 7) === localDay(priorMonth).slice(0, 7))
    .at(-1);
  const monthDelta = prior && current ? current.weight - prior.weight : null;
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  const plot = sorted.length
    ? sorted.map((e, i) => {
        const vals = sorted.map((e) => e.weight),
          min = Math.min(...vals) - 0.5,
          max = Math.max(...vals) + 0.5;
        return {
          x: sorted.length === 1 ? 160 : 20 + (i / (sorted.length - 1)) * 280,
          y: 125 - ((e.weight - min) / (max - min)) * 100,
          e,
        };
      })
    : [];
  const formTitle =
    editor === "weight"
      ? "Registrar peso"
      : editor === "steps"
        ? "Registrar passos"
        : "Definir meta de peso";
  const open = (kind: string) => {
    setEditor(kind);
    setValue(kind === "goal" ? weightGoal : "");
    setDate(localDay());
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return;
    if (editor === "weight") onWeight(date, n);
    else if (editor === "steps") onSteps(date, n);
    else onGoal(value);
    setEditor("");
  };
  return (
    <section className="progress-page" aria-labelledby="progress-title">
      <p className="progress-companion">FitIn Companion</p>
      <h1 id="progress-title">Seu progresso</h1>
      <div className="progress-shortcuts">
        {["Resumo", "Hábitos", "Histórico"].map((v) => (
          <button
            key={v}
            className={view === v ? "active" : ""}
            aria-pressed={view === v}
            onClick={() => setView(v)}
          >
            <i />
            {v}
            <ArrowRight size={13} />
          </button>
        ))}
      </div>
      <div className="current-plan">
        <div className="current-plan-heading">
          <div>
            <small>PLANO ATUAL</small>
            <h2>{goal}</h2>
          </div>
          <img src="/assets/coach.svg" alt="" />
          <span>{sorted.length} registros</span>
        </div>
        <div className="plan-weight-row">
          <span>
            Peso atual:{" "}
            <strong>{current ? fmt(current.weight) + " kg" : "—"}</strong>
          </span>
          <button onClick={() => open("goal")}>
            Meta:{" "}
            <strong>
              {goalWeight !== null ? fmt(goalWeight) + " kg" : "definir"}
            </strong>
          </button>
        </div>
        <div className="weight-goal-meter">
          <i style={{ width: (percent || 0) + "%" }} />
        </div>
        <div className="plan-weight-row">
          <small>
            {percent !== null
              ? `${Math.round(percent)}% do objetivo`
              : "Defina sua meta para acompanhar"}
          </small>
          <strong>{target.toLocaleString("pt-BR")} kcal/dia</strong>
        </div>
        <div className="progress-message">
          <CheckCircle2 size={17} />
          <span>
            {current
              ? "Cada registro ajuda você a acompanhar sua jornada."
              : "Comece com seu primeiro registro de peso."}
          </span>
        </div>
      </div>
      {view === "Resumo" && (
        <>
          <div className="progress-section-title">
            <h2>{period === 7 ? "Esta semana" : "Últimos 30 dias"}</h2>
            <select
              aria-label="Período do progresso"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
            >
              <option value={7}>7 dias</option>
              <option value={30}>30 dias</option>
            </select>
          </div>
          <div className="progress-metrics">
            <div>
              <span>Variação de peso</span>
              <strong>
                {delta === null
                  ? "—"
                  : `${delta > 0 ? "+" : ""}${fmt(delta)} kg`}
              </strong>
              <small>
                {sorted.length > 1
                  ? "Nos registros do período"
                  : "Adicione outro peso para comparar"}
              </small>
            </div>
            <div>
              <span>Média de calorias</span>
              <strong>
                {avgCalories === null ? "—" : fmt(avgCalories)}{" "}
                <small>kcal</small>
              </strong>
              <small>meta: {target.toLocaleString("pt-BR")} kcal/dia</small>
              <div className="metric-meter">
                <i
                  style={{
                    width:
                      Math.min(100, ((avgCalories || 0) / target) * 100) + "%",
                  }}
                />
              </div>
              <small>
                {foodDays.size}{" "}
                {foodDays.size === 1
                  ? "dia com registro"
                  : "dias com registros"}{" "}
                · parcial
              </small>
            </div>
            <div>
              <span>Treinos registrados</span>
              <strong>{windowWorkouts.length}</strong>
              <small>
                {windowWorkouts.reduce((s, e) => s + e.kcal, 0)} kcal de
                atividades
              </small>
              <div className="workout-dots">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={i < windowWorkouts.length ? "done" : ""}
                  />
                ))}
              </div>
            </div>
            <div>
              <span>Passos registrados</span>
              <strong>
                {avgSteps === null ? "—" : fmt(avgSteps)} <small>/dia</small>
              </strong>
              <button className="metric-link" onClick={() => open("steps")}>
                {avgSteps === null
                  ? "Adicionar passos"
                  : `${windowSteps.length} dia(s) informado(s)`}
              </button>
            </div>
          </div>
          <div className="weight-history">
            <div className="progress-section-title">
              <h2>Histórico de peso</h2>
              <button onClick={() => open("weight")}>
                <Plus size={16} /> Registrar
              </button>
            </div>
            {plot.length ? (
              <>
                <svg
                  viewBox="0 0 320 150"
                  role="img"
                  aria-label="Evolução dos pesos registrados"
                >
                  <title>Histórico de peso</title>
                  {[25, 75, 125].map((y) => (
                    <line
                      key={y}
                      x1="15"
                      x2="305"
                      y1={y}
                      y2={y}
                      stroke="#e5dced"
                      strokeDasharray="3 5"
                    />
                  ))}
                  {plot.length > 1 && (
                    <polyline
                      points={plot.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="none"
                      stroke="#ff8774"
                      strokeWidth="3"
                    />
                  )}
                  {plot.map((p) => (
                    <circle
                      key={p.e.date}
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      fill="#ff8774"
                      stroke="white"
                    >
                      <title>
                        {p.e.date}: {p.e.weight} kg
                      </title>
                    </circle>
                  ))}
                </svg>
                <div className="weight-chart-labels">
                  <span>
                    {new Date(sorted[0].date + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                  <span>
                    {new Date(current!.date + "T12:00:00").toLocaleDateString(
                      "pt-BR",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="weight-empty">
                <TrendingUp />
                <p>Seu primeiro peso dá início ao gráfico.</p>
                <button onClick={() => open("weight")}>Registrar peso</button>
              </div>
            )}
            <div className="body-fat-note">
              <span>Percentual de gordura</span>
              <strong>Estimativa em definição</strong>
            </div>
          </div>
          <div className="month-comparison">
            <h3>COMPARATIVO COM O MÊS ANTERIOR</h3>
            <div>
              <span>
                <strong>
                  {monthDelta === null
                    ? "—"
                    : `${monthDelta > 0 ? "+" : ""}${fmt(monthDelta)} kg`}
                </strong>
                Peso registrado
              </span>
              <span>
                <strong>{recordDays.size}</strong>Dias com registros no período
              </span>
            </div>
            {monthDelta === null && (
              <small>Sem histórico suficiente para comparar o peso.</small>
            )}
          </div>
          <h2 className="progress-subheading">Metas e prazos</h2>
          <div className="weight-deadline">
            <div className="weight-goal-meter">
              <i style={{ width: (percent || 0) + "%" }} />
            </div>
            <div className="deadline-stages">
              <span>
                Início<strong>{first ? fmt(first.weight) + " kg" : "—"}</strong>
              </span>
              <span>
                Atual
                <strong>{current ? fmt(current.weight) + " kg" : "—"}</strong>
              </span>
              <span>
                Objetivo
                <strong>
                  {goalWeight !== null ? fmt(goalWeight) + " kg" : "Definir"}
                </strong>
              </span>
            </div>
            <div className="deadline-row">
              <span>Tempo estimado</span>
              <strong>
                {weeksLeft !== null ? `${weeksLeft} semanas` : "—"}
              </strong>
            </div>
            <div className="deadline-row">
              <span>Projeção do cenário</span>
              <strong>
                {weeksLeft !== null
                  ? finish.toLocaleDateString("pt-BR", {
                      month: "long",
                      year: "numeric",
                    })
                  : "Defina uma meta"}
              </strong>
            </div>
            <small>
              Estimativa linear do ritmo demonstrativo, sem garantia de
              resultado.
            </small>
          </div>
          <button
            className="full-history-link"
            onClick={() => setView("Histórico")}
          >
            Ver histórico completo <ArrowRight size={16} />
          </button>
        </>
      )}
      {view === "Hábitos" && (
        <div className="habit-panel">
          <h2>Seus hábitos</h2>
          <p>
            {recordDays.size} dias com registros nos últimos {period} dias.
          </p>
          <div className="habit-summary">
            <strong>{windowFoods.length} refeições</strong>
            <strong>{windowWorkouts.length} atividades</strong>
          </div>
          <div className="habit-actions">
            <button onClick={() => open("steps")}>Registrar passos</button>
            <button onClick={() => open("weight")}>Registrar peso</button>
          </div>
          <p>Refeições e atividades são compartilhadas com o Diário.</p>
        </div>
      )}
      {view === "Histórico" && (
        <div className="weight-history">
          <div className="progress-section-title">
            <h2>Todos os pesos</h2>
            <button onClick={() => open("weight")}>
              <Plus size={16} /> Registrar
            </button>
          </div>
          {sorted.length ? (
            [...sorted].reverse().map((e) => (
              <div className="weight-history-row" key={e.date}>
                <time>
                  {new Date(e.date + "T12:00:00").toLocaleDateString("pt-BR")}
                </time>
                <strong>{fmt(e.weight)} kg</strong>
              </div>
            ))
          ) : (
            <p className="weight-empty">Nenhum peso registrado.</p>
          )}
        </div>
      )}
      {editor && (
        <div className="progress-editor">
          <form onSubmit={submit}>
            <h3>{formTitle}</h3>
            {editor !== "goal" && (
              <label className="field">
                <span>Data do registro</span>
                <input
                  type="date"
                  max={localDay()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </label>
            )}
            <label className="field">
              <span>{editor === "steps" ? "Passos" : "Peso (kg)"}</span>
              <input
                autoFocus
                type="number"
                min="1"
                max={editor === "steps" ? 100000 : 500}
                step={editor === "steps" ? 1 : 0.1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </label>
            <div>
              <button className="primary">Salvar registro</button>
              <button
                type="button"
                className="text-button"
                onClick={() => setEditor("")}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
      <p className="demo-note">
        Histórico da conta demo é fictício. Novos registros ficam nesta sessão.
      </p>
    </section>
  );
}
