import { useEffect, useRef, useState } from "react";
import { ArrowRight, CalendarDays, Check, Flag, Sparkles } from "lucide-react";
import {
  challengeWeek,
  weeklyChallenges,
  weeklyProgress,
  type ChallengeSelection,
} from "./weeklyChallenges";
import type { DailyRecord } from "./records";

export function Challenges({
  foods,
  workouts,
  weights,
  selection,
  onSelection,
}: {
  foods: DailyRecord[];
  workouts: DailyRecord[];
  weights: { date: string; weight: number }[];
  selection: ChallengeSelection[];
  onSelection: (value: ChallengeSelection[]) => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const [announcement, setAnnouncement] = useState("");
  const picker = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const week = challengeWeek(now);
  const current = selection.filter((item) => item.week === week.start);
  const active = weeklyChallenges.filter((challenge) =>
    current.some((item) => item.id === challenge.id),
  );
  const progress = weeklyProgress(foods, workouts, weights, now);
  const dateLabel = (day: string) =>
    new Date(day + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  const choose = () => {
    picker.current?.focus({ preventScroll: true });
    picker.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };
  const toggle = (id: string, name: string) => {
    const joined = current.some((item) => item.id === id);
    onSelection(
      joined
        ? current.filter((item) => item.id !== id)
        : [...current, { id, week: week.start }],
    );
    setAnnouncement(
      joined ? `Você saiu de ${name}.` : `Você está participando de ${name}.`,
    );
  };
  return (
    <div className="weekly-challenges">
      <section aria-labelledby="my-challenges-title">
        <div className="challenge-heading">
          <div>
            <span className="challenge-eyebrow">UM PASSO DE CADA VEZ</span>
            <h2 id="my-challenges-title">Meus desafios</h2>
          </div>
          <button className="choose-challenges" onClick={choose}>
            Escolher desafios <ArrowRight size={16} />
          </button>
        </div>
        <p className="challenge-intro">
          Você escolhe o que faz sentido para a sua semana.
        </p>
        {active.length === 0 ? (
          <div className="challenge-empty">
            <span className="challenge-empty-icon">
              <Flag size={27} />
            </span>
            <h3>Sua próxima conquista começa aqui</h3>
            <p>Escolha um desafio abaixo. Sem competição, no seu ritmo.</p>
            <button onClick={choose}>
              Explorar desafios <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div className="active-challenges">
            {active.map((challenge) => {
              const value = Math.min(challenge.target, progress[challenge.id]);
              const done = value >= challenge.target;
              return (
                <article
                  key={challenge.id}
                  className={`active-challenge challenge-${challenge.color}`}
                  aria-label={challenge.name}
                >
                  <div className="challenge-card-top">
                    <span>
                      {done ? <Check size={17} /> : <Flag size={17} />}
                      {done ? "Concluído" : "Em andamento"}
                    </span>
                    <button
                      onClick={() => toggle(challenge.id, challenge.name)}
                      aria-label={`Sair do desafio ${challenge.name}`}
                    >
                      Sair
                    </button>
                  </div>
                  <img
                    className="challenge-illustration active-challenge-art"
                    src={`/assets/achievements/challenge-${challenge.id}.svg`}
                    alt=""
                  />
                  <h3>{challenge.name}</h3>
                  <p>{challenge.description}</p>
                  <div
                    className="challenge-meter"
                    role="progressbar"
                    aria-label={`Progresso: ${challenge.name}`}
                    aria-valuemin={0}
                    aria-valuemax={challenge.target}
                    aria-valuenow={value}
                  >
                    <i
                      style={{ width: `${(value / challenge.target) * 100}%` }}
                    />
                  </div>
                  <div className="challenge-progress-label">
                    <strong>
                      {value} de {challenge.target} {challenge.unit}
                    </strong>
                    <span>Até {dateLabel(week.end)}</span>
                  </div>
                  <div className={`challenge-reward ${done ? "unlocked" : ""}`}>
                    <img
                      className="challenge-seal"
                      src={`/assets/achievements/challenge-${challenge.id}.svg`}
                      alt=""
                    />
                    <span>
                      {done ? "Selo conquistado" : "Recompensa"}:{" "}
                      <strong>{challenge.reward}</strong>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <section
        className="weekly-challenge-banner"
        aria-labelledby="weekly-challenges-title"
      >
        <div className="weekly-challenge-intro">
          <div>
            <div className="challenge-heading weekly-heading">
              <h2 id="weekly-challenges-title" ref={picker} tabIndex={-1}>
                Desafios da semana
              </h2>
              <span>
                <CalendarDays size={15} />
                {dateLabel(week.start)} – {dateLabel(week.end)}
              </span>
            </div>
            <p className="challenge-intro">
              Quatro convites para cuidar da sua rotina.
              <span className="challenge-swipe-hint">
                {" "}
                Deslize para explorar.
              </span>
            </p>
          </div>
          <div className="weekly-guide-art" aria-hidden="true">
            <img src="/assets/challenges-guide.svg" alt="" />
            <span className="weekly-board-note">
              Seu próximo passo começa aqui.
            </span>
          </div>
        </div>
        <div
          className="challenge-options"
          role="region"
          aria-label="Opções de desafios semanais"
          tabIndex={0}
        >
          {weeklyChallenges.map((challenge, index) => {
            const joined = current.some((item) => item.id === challenge.id);
            return (
              <article
                key={challenge.id}
                className={`challenge-option challenge-${challenge.color}`}
              >
                <span className="challenge-number">
                  0{index + 1}
                  <span>SEMANA</span>
                </span>
                <img
                  className="challenge-illustration"
                  src={`/assets/achievements/challenge-${challenge.id}.svg`}
                  alt=""
                />
                <h3>{challenge.name}</h3>
                <p>{challenge.description}</p>
                <span className="challenge-option-reward">
                  <Sparkles size={15} />
                  Selo: {challenge.reward}
                </span>
                <button
                  disabled={joined}
                  onClick={() => toggle(challenge.id, challenge.name)}
                  aria-label={`${joined ? "Participando de" : "Participar de"} ${challenge.name}`}
                >
                  {joined ? (
                    <>
                      <Check size={16} />
                      Participando
                    </>
                  ) : (
                    <>
                      Participar <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </article>
            );
          })}
        </div>
        <p className="challenge-footnote">
          De segunda a domingo. Contam os registros desta semana, inclusive os
          anteriores à participação; datas futuras não contam. Escolhas e selos
          ficam só nesta sessão e são limpos ao sair. Os selos semanais não
          alteram o XP das medalhas.
        </p>
      </section>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </div>
  );
}
