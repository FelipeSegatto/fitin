import { useEffect, useRef, useState } from "react";
import { Check, Image, Lock, X } from "lucide-react";
import "./achievements.css";
import { Challenges } from "./Challenges";
import type { ChallengeSelection } from "./weeklyChallenges";
import type { DailyRecord } from "./records";
import {
  achievementSummary,
  medalAsset,
  type Medal,
  type AchievementHistory,
} from "./medalCollection";
import { MedalCatalog } from "./MedalCatalog";
export { type AchievementHistory } from "./medalCollection";
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
    achievementSummary(streak, foods, workoutCalories, history, {
      foods: foodRecords,
      workouts: workoutRecords,
    });
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
  const matching = medals.filter(
    (m) =>
      filter === "Todas" ||
      (filter === "Conquistadas"
        ? m.current >= m.target
        : m.current < m.target),
  );
  const visible = matching.slice(0, 6);
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
        <img src="/assets/achievements-buddy.svg" alt="" />
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
          <strong>
            {earned.length}/{medals.length}
          </strong>
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
        <Image size={20} aria-hidden="true" /> Ver todas as medalhas
        <span>{medals.length}</span>
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
        <span>
          {earned.length} de {medals.length} conquistadas
        </span>
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
                "medal-card medal-variant-" +
                m.variant +
                " medal-kind-" +
                m.kind +
                " medal-tone-" +
                m.color +
                " " +
                (done ? "earned" : "locked")
              }
              onClick={() => setSelected(m)}
              aria-label={`${m.name}, ${done ? "conquistada" : `${m.current} de ${m.target} ${m.unit}`}, ${m.xp} XP`}
            >
              <div className={"medal-art " + m.color}>
                <img src={medalAsset(m.metal, done, m.kind)} alt="" />
                <span className="medal-status">
                  {done ? <Check size={13} /> : <Lock size={12} />}
                </span>
              </div>
              <h3>{m.name}</h3>
              <span className="medal-tier">
                {m.kind === "medallion" ? "Medalha" : "Haltere"}
              </span>
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
      {matching.length > visible.length && (
        <p className="collection-more">
          Mostrando {visible.length} de {matching.length}.{" "}
          <button onClick={() => setShowPreview(true)}>
            Consultar catálogo completo
          </button>
        </p>
      )}
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
      {showPreview && (
        <MedalCatalog medals={medals} close={() => setShowPreview(false)} />
      )}
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
        <div
          className={"medal-art medal-kind-" + medal.kind + " " + medal.color}
        >
          <img src={medalAsset(medal.metal, done, medal.kind)} alt="" />
        </div>
        <h2 id="medal-title">{medal.name}</h2>

        <span className="xp-pill">+{medal.xp} XP</span>
        <p>{medal.description}</p>
        <div className="medal-challenge-list">
          {medal.challenges.map((challenge) => (
            <div key={challenge.name}>
              <strong>{challenge.name}</strong>
              <span>
                {Math.min(challenge.current, challenge.target).toLocaleString(
                  "pt-BR",
                )}{" "}
                / {challenge.target.toLocaleString("pt-BR")} {challenge.unit}
              </span>
            </div>
          ))}
        </div>
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
