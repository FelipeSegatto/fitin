import { useEffect, useRef, useState } from "react";
import { Check, Image, Lock, X } from "lucide-react";
import "./achievements.css";
import { Challenges } from "./Challenges";
import type { ChallengeSelection } from "./weeklyChallenges";
import type { DailyRecord } from "./records";
export type AchievementHistory = {
  days: number;
  meals: number;
  burned: number;
};
type Medal = {
  id: string;
  name: string;
  description: string;
  xp: number;
  current: number;
  target: number;
  unit: string;
  metal: string;
  color: string;
};
export function medalAsset(metal: string, earned = true) {
  if (metal === "pink") return "/assets/medal-pink.png";
  return `/assets/medal-${earned ? metal : "silver"}.svg`;
}

export function achievementSummary(
  streak: number,
  foods: number,
  workoutCalories: number,
  history: AchievementHistory,
) {
  const medals: Medal[] = [
    {
      id: "workout",
      name: "Treino em dia",
      description: "Registre sua primeira atividade física.",
      xp: 100,
      current: history.burned + workoutCalories > 0 ? 1 : 0,
      target: 1,
      unit: "atividade",
      metal: "gold",
      color: "coral",
    },
    {
      id: "meals",
      name: "Rotina alimentar",
      description: "Registre 10 refeições ao longo da sua jornada.",
      xp: 100,
      current: history.meals + foods,
      target: 10,
      unit: "refeições",
      metal: "gold",
      color: "yellow",
    },
    {
      id: "week",
      name: "7 dias seguidos",
      description: "Mantenha sua sequência de registros por sete dias.",
      xp: 200,
      current: streak,
      target: 7,
      unit: "dias",
      metal: "bronze",
      color: "purple",
    },
    {
      id: "focus",
      name: "Foco total",
      description:
        "Registre refeições ou atividades em 30 dias. Os dias não precisam ser consecutivos.",
      xp: 250,
      current: history.days + (foods || workoutCalories ? 1 : 0),
      target: 30,
      unit: "dias",
      metal: "gold",
      color: "blue",
    },
    {
      id: "energy",
      name: "Grande energia",
      description:
        "Some 10.000 kcal em atividades registradas. Os valores são demonstrativos.",
      xp: 300,
      current: history.burned + workoutCalories,
      target: 10000,
      unit: "kcal",
      metal: "pink",
      color: "pink",
    },
    {
      id: "first",
      name: "Primeiro passo",
      description: "Registre sua primeira refeição no FitIn.",
      xp: 50,
      current: history.meals + foods > 0 ? 1 : 0,
      target: 1,
      unit: "refeição",
      metal: "bronze",
      color: "mint",
    },
  ];
  // Each medal awards XP once, derived from the current demo records.
  const earned = medals.filter((m) => m.current >= m.target),
    xp = earned.reduce((s, m) => s + m.xp, 0),
    pending = medals.filter((m) => m.current < m.target);
  const levels = [
    { min: 0, max: 100, name: "Iniciante" },
    { min: 100, max: 300, name: "Explorador" },
    { min: 300, max: 700, name: "Colecionador" },
    { min: 700, max: 1200, name: "Atleta" },
    { min: 1200, max: Infinity, name: "Lenda FitIn" },
  ];
  const levelIndex = levels.findIndex((l) => xp < l.max),
    level = levels[levelIndex],
    levelProgress = Number.isFinite(level.max)
      ? (xp - level.min) / (level.max - level.min)
      : 1;
  return { medals, earned, xp, pending, levelIndex, level, levelProgress };
}
export function Achievements({
  streak,
  foods,
  workoutCalories,
  history,
  foodRecords,
  workoutRecords,
  weights,
  challenges,
  onChallenges,
}: {
  streak: number;
  foods: number;
  workoutCalories: number;
  history: AchievementHistory;
  foodRecords: DailyRecord[];
  workoutRecords: DailyRecord[];
  weights: { date: string; weight: number }[];
  challenges: ChallengeSelection[];
  onChallenges: (value: ChallengeSelection[]) => void;
}) {
  const [selected, setSelected] = useState<Medal | null>(null),
    [filter, setFilter] = useState("Todas"),
    [showPreview, setShowPreview] = useState(false);
  const { medals, earned, xp, pending, levelIndex, level, levelProgress } =
    achievementSummary(streak, foods, workoutCalories, history);
  const closest = pending.reduce<Medal | null>(
    (best, m) =>
      !best || m.current / m.target > best.current / best.target ? m : best,
    null,
  );
  const now = new Date(),
    monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const today = date.toDateString() === now.toDateString();
    const age = Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
        date.getTime()) /
        86400000,
    );
    return { date, today, done: age >= 0 && age < streak };
  });
  const visible = medals.filter(
    (m) =>
      filter === "Todas" ||
      (filter === "Conquistadas"
        ? m.current >= m.target
        : m.current < m.target),
  );
  return (
    <section className="achievements" aria-labelledby="achievements-title">
      <div className="ach-title">
        <h1 id="achievements-title">Conquistas</h1>
        <span className="streak-chip">
          <i />
          {streak} {streak === 1 ? "dia" : "dias"}
        </span>
      </div>
      <div className="level-card">
        <div>
          <small>NÍVEL {levelIndex + 1}</small>
          <h2>{level.name}</h2>
        </div>
        <img src="/assets/happy.svg" alt="" />
        <div
          className="level-segments"
          aria-label={`Progresso do nível: ${Math.round(levelProgress * 100)}%`}
        >
          {Array.from({ length: 10 }, (_, i) => (
            <i
              key={i}
              className={i < Math.floor(levelProgress * 10) ? "complete" : ""}
            />
          ))}
        </div>
        <div className="level-labels">
          <strong>{xp} XP</strong>
          <span>
            {Number.isFinite(level.max)
              ? `${level.max - xp} para o nível ${levelIndex + 2}`
              : "Nível máximo"}
          </span>
        </div>
      </div>
      <div className="ach-stats">
        <div>
          <strong>{earned.length}/6</strong>
          <span>Medalhas</span>
        </div>
        <div>
          <strong>{xp}</strong>
          <span>Total XP</span>
        </div>
        <div>
          <strong>{pending.length}</strong>
          <span>Em progresso</span>
        </div>
      </div>
      <button
        className="medal-preview-button"
        onClick={() => setShowPreview(true)}
      >
        <Image size={20} aria-hidden="true" /> Ver novas medalhas
        <span>Prévia</span>
      </button>
      <Challenges
        foods={foodRecords}
        workouts={workoutRecords}
        weights={weights}
        selection={challenges}
        onSelection={onChallenges}
      />
      <div className="week-card">
        <div className="section-title">
          <h2>Sua semana</h2>
          <strong>
            {streak} {streak === 1 ? "dia seguido" : "dias seguidos"}
          </strong>
        </div>
        <div className="week-days">
          {week.map((d, i) => (
            <div key={i}>
              <span
                className={(d.done ? "done " : "") + (d.today ? "today" : "")}
              >
                {["S", "T", "Q", "Q", "S", "S", "D"][i]}
              </span>
              <small>
                {d.today ? "hoje" : String(d.date.getDate()).padStart(2, "0")}
              </small>
            </div>
          ))}
        </div>
        <p>
          Um registro por dia já conta. Seus registros de hoje mantêm a
          sequência.
        </p>
      </div>
      <div className="section-title collection-title">
        <h2>Coleção</h2>
        <span>{earned.length} de 6 conquistadas</span>
      </div>
      <div className="medal-filters" aria-label="Filtrar medalhas">
        {["Todas", "Conquistadas", "Em progresso"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={filter === f ? "active" : ""}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="medal-grid">
        {visible.map((m) => {
          const done = m.current >= m.target;
          return (
            <button
              key={m.id}
              className={
                "medal-card medal-tone-" +
                m.color +
                " " +
                (done ? "earned" : "locked")
              }
              onClick={() => setSelected(m)}
              aria-label={`${m.name}, ${done ? "conquistada" : `${m.current} de ${m.target} ${m.unit}`}, ${m.xp} XP`}
            >
              <div className={"medal-art " + m.color}>
                <img src={medalAsset(m.metal, done)} alt="" />
                <span className="medal-status">
                  {done ? <Check size={13} /> : <Lock size={12} />}
                </span>
              </div>
              <h3>{m.name}</h3>
              {done ? (
                <span className="xp-pill">+{m.xp} XP</span>
              ) : (
                <>
                  <div className="ach-progress">
                    <i
                      style={{
                        width:
                          Math.min(100, (m.current / m.target) * 100) + "%",
                      }}
                    />
                  </div>
                  <small>
                    {m.current.toLocaleString("pt-BR")}/
                    {m.target.toLocaleString("pt-BR")} {m.unit}
                  </small>
                </>
              )}
            </button>
          );
        })}
      </div>
      {visible.length === 0 && (
        <p className="achievement-empty">
          Suas primeiras medalhas aparecem aqui. Cada registro conta!
        </p>
      )}
      {closest && (
        <button className="almost-card" onClick={() => setSelected(closest)}>
          <div
            className="almost-ring"
            style={{
              background: `conic-gradient(#ff8774 ${Math.floor((closest.current / closest.target) * 100)}%,#ffcec3 0)`,
            }}
          >
            <strong>
              {Math.floor((closest.current / closest.target) * 100)}%
            </strong>
          </div>
          <div>
            <small>QUASE LÁ</small>
            <h3>{closest.name}</h3>
            <p>
              {closest.current.toLocaleString("pt-BR")} de{" "}
              {closest.target.toLocaleString("pt-BR")} {closest.unit}
            </p>
          </div>
        </button>
      )}
      <p className="demo-note">
        Histórico e recompensas demonstrativos. XP é a soma das medalhas
        conquistadas.
      </p>
      {showPreview && <MedalPreview close={() => setShowPreview(false)} />}
      {selected && (
        <MedalDialog medal={selected} close={() => setSelected(null)} />
      )}
    </section>
  );
}
function MedalDialog({ medal, close }: { medal: Medal; close: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = medal.current >= medal.target;
  useEffect(() => {
    const old = document.activeElement as HTMLElement;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        e.preventDefault();
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      old?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        className="modal medal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medal-title"
        tabIndex={-1}
        ref={ref}
      >
        <button
          className="icon close"
          aria-label="Fechar medalha"
          onClick={close}
        >
          <X />
        </button>
        <div className={"medal-art " + medal.color}>
          <img src={medalAsset(medal.metal, done)} alt="" />
        </div>
        <h2 id="medal-title">{medal.name}</h2>
        <span className="xp-pill">+{medal.xp} XP</span>
        <p>{medal.description}</p>
        <strong>
          {done
            ? "Medalha conquistada!"
            : `${medal.current.toLocaleString("pt-BR")} de ${medal.target.toLocaleString("pt-BR")} ${medal.unit}`}
        </strong>
        <small>
          {done
            ? "A recompensa já está incluída no seu total de XP."
            : "A medalha é liberada automaticamente ao atingir a meta."}
        </small>
      </div>
    </div>
  );
}

function MedalPreview({ close }: { close: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        event.preventDefault();
        ref.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previousFocus?.focus();
    };
  }, [close]);
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="modal medal-preview-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medal-preview-title"
        aria-describedby="medal-preview-description"
      >
        <button
          ref={ref}
          className="icon close"
          aria-label="Fechar prévia"
          onClick={close}
        >
          <X />
        </button>
        <h2 id="medal-preview-title">Novas medalhas</h2>
        <p id="medal-preview-description">
          Ouro, prata, bronze e diamante. Uma proposta para a coleção; os
          halteres continuam como suas medalhas.
        </p>
        <img
          src="/assets/achievements/medal-preview.png"
          alt="Quatro propostas de medalhas: ouro com haltere, prata com calendário, bronze com broto e diamante azul com alvo."
        />
        <h3 className="pink-preview-title">Haltere rosa · Grande energia</h3>
        <img
          src="/assets/medal-pink.png"
          alt="Haltere rosa metálico com barra vinho e reflexos claros, em teste na medalha Grande energia."
        />
      </div>
    </div>
  );
}
