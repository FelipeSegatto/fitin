import { useState } from "react";
import {
  Award,
  Flame,
  Plus,
  Target,
  UserRound,
  HelpCircle,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { achievementSummary, type AchievementHistory } from "./Achievements";
import { type DailyRecord, localDay } from "./records";
import { type WeightRecord } from "./Progress";
import "./profile.css";
type Props = {
  name: string;
  email: string;
  streak: number;
  foods: DailyRecord[];
  workouts: DailyRecord[];
  weights: WeightRecord[];
  weightGoal: string;
  rate: number;
  target: number;
  history: AchievementHistory;
  onProgress: (action: "weight" | "goal" | "history") => void;
  onAchievements: () => void;
  onAdjust: () => void;
  onAccount: (name: string, email: string) => void;
  onLogout: () => void;
};
export function Profile({
  name,
  email,
  streak,
  foods,
  workouts,
  weights,
  weightGoal,
  rate,
  target,
  history,
  onProgress,
  onAchievements,
  onAdjust,
  onAccount,
  onLogout,
}: Props) {
  const [panel, setPanel] = useState(""),
    [editName, setEditName] = useState(name),
    [editEmail, setEditEmail] = useState(email),
    [saved, setSaved] = useState(false);
  const initials = (name || "Visitante")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase(),
    sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date)),
    first = sorted[0],
    current = sorted.at(-1),
    goal = weightGoal ? Number(weightGoal) : null;
  const today = localDay(),
    todayFoods = foods.filter((e) => e.date === today),
    todayBurned = workouts
      .filter((e) => e.date === today)
      .reduce((s, e) => s + e.kcal, 0),
    ach = achievementSummary(streak, todayFoods.length, todayBurned, history);
  const progress =
    first && current && goal !== null
      ? Math.max(
          0,
          Math.min(
            100,
            first.weight === goal
              ? current.weight === goal
                ? 100
                : 0
              : ((first.weight - current.weight) / (first.weight - goal)) * 100,
          ),
        )
      : 0;
  const fmt = (v: number) =>
      v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }),
    remaining =
      current && goal !== null ? Math.abs(current.weight - goal) : null,
    delta = current && first ? current.weight - first.weight : null;
  const month = today.slice(0, 7),
    monthFoods = foods.filter((e) => e.date.startsWith(month)),
    monthWorkouts = workouts.filter((e) => e.date.startsWith(month)),
    days = new Set([...monthFoods, ...monthWorkouts].map((e) => e.date));
  const toggle = (name: string) => {
    setPanel((p) => (p === name ? "" : name));
    setSaved(false);
  };
  return (
    <section className="profile-page" aria-label="Seu perfil">
      <div className="profile-hero">
        <div className="profile-identity">
          <div className="profile-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h1>{name || "Visitante"}</h1>
            <p>Seu ritmo, suas conquistas.</p>
          </div>
          <button
            className="profile-award"
            aria-label="Ver minhas conquistas"
            onClick={onAchievements}
          >
            <Award size={20} />
          </button>
        </div>
        <div className="profile-badges">
          <span>
            NÍVEL {ach.levelIndex + 1} / {ach.level.name.toUpperCase()}
          </span>
          <span>
            <Flame size={13} />
            {streak} {streak === 1 ? "DIA" : "DIAS"}
          </span>
        </div>
      </div>
      <section className="profile-journey">
        <div className="profile-section-heading">
          <h2>Sua jornada</h2>
          <span>
            {delta === null
              ? "Seu primeiro passo"
              : `${delta > 0 ? "+" : ""}${fmt(delta)} kg até agora`}
          </span>
        </div>
        <div className="journey-labels">
          <span>
            Início: <strong>{first ? fmt(first.weight) + " kg" : "—"}</strong>
          </span>
          <button onClick={() => onProgress("history")}>
            {current ? fmt(current.weight) + " kg" : "Ver histórico"}
          </button>
          <button className="journey-target" onClick={() => onProgress("goal")}>
            Meta: {goal !== null ? fmt(goal) + " kg" : "definir"}
          </button>
        </div>
        <div className="journey-meter">
          <i style={{ width: progress + "%" }} />
        </div>
        <div className="journey-counters">
          <div>
            <small>
              {remaining === 0 ? "OBJETIVO ATINGIDO" : "DISTÂNCIA DA META"}
            </small>
            <strong>
              {remaining !== null ? fmt(remaining) + " kg" : "Definir meta"}
            </strong>
          </div>
          <div>
            <small>RITMO DEMONSTRATIVO</small>
            <strong>{fmt(rate)} kg/sem</strong>
          </div>
        </div>
        <button
          className="profile-weight-button"
          onClick={() => onProgress("weight")}
        >
          <Plus size={18} /> Registrar peso de hoje
        </button>
      </section>
      <h2 className="profile-subheading">Neste mês</h2>
      <p className="profile-stat-note">
        Resumo dos registros disponíveis no Diário.
      </p>
      <div className="profile-month">
        <div>
          <strong>{days.size}</strong>
          <span>
            dias com
            <br />
            registros
          </span>
        </div>
        <div>
          <strong>{monthWorkouts.length}</strong>
          <span>
            atividades
            <br />
            registradas
          </span>
        </div>
        <div>
          <strong>{monthFoods.length}</strong>
          <span>
            refeições
            <br />
            registradas
          </span>
        </div>
      </div>
      <section className="profile-medals">
        <div className="profile-section-heading">
          <h2>Medalhas conquistadas</h2>
          <button onClick={onAchievements}>Ver todas</button>
        </div>
        {ach.earned.length ? (
          <div className="profile-medal-list">
            {ach.earned.slice(-3).map((m) => (
              <button
                key={m.id}
                onClick={onAchievements}
                aria-label={"Ver coleção: " + m.name}
              >
                <span className={"mini-medal " + m.color}>
                  <img src={"/assets/medal-" + m.metal + ".svg"} alt="" />
                </span>
                <small>{m.name}</small>
              </button>
            ))}
            {ach.earned.length > 3 && (
              <button className="extra-medals" onClick={onAchievements}>
                <span>+{ach.earned.length - 3}</span>
                <small>na coleção</small>
              </button>
            )}
          </div>
        ) : (
          <p className="profile-no-medals">
            Seu primeiro registro pode render a primeira medalha.
          </p>
        )}
      </section>
      <h2 className="profile-subheading">Ajustes</h2>
      <div className="profile-settings">
        <button
          className="settings-row"
          aria-expanded={panel === "goals"}
          onClick={() => toggle("goals")}
        >
          <span className="settings-icon orange">
            <Target size={21} />
          </span>
          <span>
            <strong>Metas de peso e nutrição</strong>
            <small>Calorias, ritmo e objetivo</small>
          </span>
          <ChevronRight size={17} />
        </button>
        {panel === "goals" && (
          <div className="settings-content">
            <p>
              Meta do cenário:{" "}
              <strong>{target.toLocaleString("pt-BR")} kcal/dia</strong>
            </p>
            <button onClick={() => onProgress("goal")}>
              Definir meta de peso <ChevronRight size={14} />
            </button>
            <button onClick={onAdjust}>
              Ajustar meu ritmo <ChevronRight size={14} />
            </button>
          </div>
        )}
        <button
          className="settings-row"
          aria-expanded={panel === "account"}
          onClick={() => toggle("account")}
        >
          <span className="settings-icon purple">
            <UserRound size={21} />
          </span>
          <span>
            <strong>Configurações da conta</strong>
            <small>Nome e e-mail da sessão</small>
          </span>
          <ChevronRight size={17} />
        </button>
        {panel === "account" && (
          <form
            className="settings-content"
            onSubmit={(e) => {
              e.preventDefault();
              if (!editName.trim()) return;
              onAccount(editName.trim(), editEmail.trim());
              setSaved(true);
            }}
          >
            <label className="field">
              <span>Seu nome</span>
              <input
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  setSaved(false);
                }}
                required
                maxLength={80}
              />
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => {
                  setEditEmail(e.target.value);
                  setSaved(false);
                }}
                required
              />
            </label>
            <button className="primary">Salvar dados</button>
            {saved && (
              <p className="profile-saved" role="status">
                Dados atualizados nesta sessão.
              </p>
            )}
            <small className="profile-account-note">
              A demo não altera uma conta real.
            </small>
          </form>
        )}
        <button
          className="settings-row"
          aria-expanded={panel === "help"}
          onClick={() => toggle("help")}
        >
          <span className="settings-icon blue">
            <HelpCircle size={21} />
          </span>
          <span>
            <strong>Ajuda e suporte</strong>
            <small>Entenda a demo e os registros</small>
          </span>
          <ChevronRight size={17} />
        </button>
        {panel === "help" && (
          <div className="settings-content profile-faq">
            <details>
              <summary>Meus dados ficam salvos?</summary>
              <p>
                Os registros ficam somente nesta sessão. Recarregar a página ou
                sair limpa a demonstração.
              </p>
            </details>
            <details>
              <summary>Como preencher os macros?</summary>
              <p>
                No Diário, edite a refeição para informar proteínas,
                carboidratos e gorduras. Valores ausentes deixam o resumo
                parcial.
              </p>
            </details>
            <details>
              <summary>O plano é uma recomendação nutricional?</summary>
              <p>
                Não. Metas, projeções e histórico de exemplo são demonstrativos.
              </p>
            </details>
          </div>
        )}
      </div>
      <button
        className="profile-logout"
        aria-label="Sair e limpar demonstração"
        onClick={onLogout}
      >
        <LogOut size={15} /> Sair da conta
      </button>
      <p className="profile-footer">FitIn · No seu ritmo</p>
    </section>
  );
}
