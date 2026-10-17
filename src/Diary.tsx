import { calorieFeedback } from "./nutritionPlans";
import { calorieBalance } from "./calorieBalance";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  Dumbbell,
  Pencil,
  Trash2,
  PlusCircle,
  Bell,
} from "lucide-react";
import { type DailyRecord, localDay } from "./records";
import "./diary.css";
type Props = {
  plan: string;
  onNotifications: () => void;
  foods: DailyRecord[];
  workouts: DailyRecord[];
  target: number;
  onAdd: (kind: "food" | "workout", date: string) => void;
  onEdit: (kind: "food" | "workout", entry: DailyRecord) => void;
  onDelete: (kind: "food" | "workout", id: string) => void;
};
export function Diary({
  plan,
  onNotifications,
  foods,
  workouts,
  target,
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [date, setDate] = useState(localDay()),
    [deleting, setDeleting] = useState<string | null>(null);
  const foodDay = foods
      .filter((e) => e.date === date)
      .sort((a, b) => a.time.localeCompare(b.time)),
    workoutDay = workouts
      .filter((e) => e.date === date)
      .sort((a, b) => a.time.localeCompare(b.time));
  const consumed = foodDay.reduce((s, i) => s + i.kcal, 0),
    burned = workoutDay.reduce((s, i) => s + i.kcal, 0);
  const {netBalance: netCalories, foodExcess} = calorieBalance(target, consumed, burned);
  const feedback = calorieFeedback(plan, netCalories);
  const macros = [
    {
      key: "protein" as const,
      name: "Proteínas",
      goal: Math.round((target * 0.3) / 4),
      color: "protein",
    },
    {
      key: "carbs" as const,
      name: "Carboidratos",
      goal: Math.round((target * 0.4) / 4),
      color: "carbs",
    },
    {
      key: "fat" as const,
      name: "Gorduras",
      goal: Math.round((target * 0.3) / 9),
      color: "fat",
    },
  ];
  const shifted = (n: number) => {
    const d = new Date(date + "T12:00:00");
    d.setDate(d.getDate() + n);
    return localDay(d);
  };
  const days = Array.from({ length: 5 }, (_, i) => {
    const key = shifted(i - 2),
      d = new Date(key + "T12:00:00");
    return { key, d };
  });
  const format = (n: number) =>
    n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  const entryCard = (
    kind: "food" | "workout",
    e: DailyRecord,
    index: number,
  ) => (
    <article
      key={e.id}
      className={
        "diary-entry " +
        (kind === "workout"
          ? "entry-workout"
          : ["entry-pink", "entry-mint", "entry-yellow", "entry-purple"][
              index % 4
            ])
      }
    >
      <div className="entry-heading">
        <h3>
          {kind === "food" ? <Utensils size={19} /> : <Dumbbell size={19} />}
          <span>{kind === "food" ? e.meal || "Refeição" : e.name}</span>
        </h3>
        <time>{e.time}</time>
      </div>
      {kind === "food" && <p>{e.name}</p>}
      {kind === "workout" && e.minutes && (
        <p>{e.minutes} minutos de atividade</p>
      )}
      {kind === "workout" && e.calorieOrigin && <p className="entry-activity-source">
        {e.activity ? <>Estimativa · {e.activity.detail} · {e.activity.weightKg} kg · <a href={e.activity.source.url} target="_blank" rel="noreferrer">{e.activity.source.name}</a></> : e.calorieOrigin === "device" ? "Calorias ativas informadas · relógio ou aplicativo" : "Calorias informadas manualmente"}
      </p>}
      {kind === "food" && (
        <p className="entry-macros">
          {e.protein !== undefined ? `P ${format(e.protein)} g` : "P —"} ·{" "}
          {e.carbs !== undefined ? `C ${format(e.carbs)} g` : "C —"} ·{" "}
          {e.fat !== undefined ? `G ${format(e.fat)} g` : "G —"}
        </p>
      )}
      {kind === "food" && e.nutrition && (
        <p className="entry-nutrition-source">
          {e.nutrition.amount} {e.nutrition.food.basis.unit} ·{" "}
          {e.nutrition.food.sourceUrl ? <a href={e.nutrition.food.sourceUrl} target="_blank" rel="noreferrer">{e.nutrition.food.sourceName}</a> : <span>{e.nutrition.food.sourceName}</span>}
        </p>
      )}
      <div className="entry-bottom">
        <strong>{e.kcal} kcal</strong>
        <div>
          <button
            aria-label={`Editar ${e.name}`}
            onClick={() => onEdit(kind, e)}
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            className="delete-entry"
            aria-label={`Excluir ${e.name}`}
            onClick={() => setDeleting(e.id)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      {deleting === e.id && (
        <div className="delete-confirm">
          <p>Excluir este registro?</p>
          <button
            onClick={() => {
              onDelete(kind, e.id);
              setDeleting(null);
            }}
          >
            Sim, excluir
          </button>
          <button onClick={() => setDeleting(null)}>Cancelar</button>
        </div>
      )}
    </article>
  );
  return (
    <section className="diary" aria-labelledby="diary-title">
      <div className="diary-title">
        <h1 id="diary-title">Diário</h1>
        <div className="diary-date-controls">
          <label className="diary-date">
            <span>Escolher dia</span>
            <input
              type="date"
              aria-label="Data do diário"
              value={date}
              onChange={(e) => {
                if (e.target.value) setDate(e.target.value);
              }}
            />
          </label>
          <button
            className="icon diary-bell"
            aria-label="Notificações"
            onClick={onNotifications}
          >
            <Bell size={18} />
          </button>
        </div>
      </div>
      <div className="date-navigation">
        <button
          className="icon"
          aria-label="Dia anterior"
          onClick={() => setDate(shifted(-1))}
        >
          <ChevronLeft size={17} />
        </button>
        <div className="diary-days">
          {days.map(({ key, d }) => (
            <button
              key={key}
              className={date === key ? "selected" : ""}
              aria-pressed={date === key}
              aria-label={d.toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
              })}
              onClick={() => setDate(key)}
            >
              <span>
                {d
                  .toLocaleDateString("pt-BR", { weekday: "short" })
                  .replace(".", "")}
              </span>
              <strong>{d.getDate()}</strong>
            </button>
          ))}
        </div>
        <button
          className="icon"
          aria-label="Próximo dia"
          onClick={() => setDate(shifted(1))}
        >
          <ChevronRight size={17} />
        </button>
      </div>
      <div className="diary-hero">
        <img
          className="diary-hero-mascot"
          src="/assets/desktop-chef.svg"
          alt=""
        />
        <div>
          <span>Consumo total</span>
          <strong>
            {format(consumed)} <small>/ {format(target)} kcal</small>
          </strong>
        </div>
        <div>
          <span>{netCalories === 0 ? "Equilíbrio" : netCalories < 0 ? "Déficit após atividades" : "Superávit após atividades"}</span>
          <strong className={`balance-result balance-${feedback.tone}${feedback.tone === "warning" ? " calorie-excess" : ""}`}>
            {format(netCalories)} <small>kcal</small>
          </strong>
        </div>
        {foodExcess > 0 && <p className="food-excess-note">Alimentação: <strong>{format(foodExcess)} kcal a mais</strong> que a meta antes do ajuste por atividades.</p>}
        {burned > 0 && (
          <p>Atividades consideradas no saldo: {format(burned)} kcal.</p>
        )}
      </div>
      <section className="macro-summary" aria-labelledby="macro-title">
        <div className="macro-heading">
          <h2 id="macro-title">Macros do dia</h2>
          <small>consumo / meta demo</small>
        </div>
        <div className="macro-grid">
          {macros.map((m) => {
            const known = foodDay.filter((e) => e[m.key] !== undefined),
              total = known.reduce((s, e) => s + (e[m.key] || 0), 0),
              missing = foodDay.length - known.length;
            return (
              <div key={m.key} className={"macro-item " + m.color}>
                <span>{m.name}</span>
                <strong>
                  {foodDay.length && !known.length ? "—" : format(total)}
                  <small>{known.length || !foodDay.length ? " g" : ""}</small>
                </strong>
                <small>
                  de {m.goal} g{missing ? " · parcial" : ""}
                </small>
                <div className="macro-meter">
                  <i
                    style={{
                      width: Math.min(100, (total / m.goal) * 100) + "%",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {foodDay.some(
          (e) =>
            e.protein === undefined ||
            e.carbs === undefined ||
            e.fat === undefined,
        ) && (
          <p>
            Algumas refeições estão sem macros. Edite os registros para
            completar o resumo.
          </p>
        )}
      </section>
      <div className="diary-section-heading">
        <h2>
          Refeições <span>{foodDay.length}</span>
        </h2>
        <button onClick={() => onAdd("food", date)}>
          <PlusCircle size={17} /> Adicionar
        </button>
      </div>
      {foodDay.length ? (
        foodDay.map((e, i) => entryCard("food", e, i))
      ) : (
        <div className="diary-empty">
          <Utensils />
          <p>Nenhuma refeição registrada neste dia.</p>
          <button onClick={() => onAdd("food", date)}>
            Registrar primeira refeição
          </button>
        </div>
      )}
      <div className="diary-section-heading">
        <h2>
          Atividades <span>{workoutDay.length}</span>
        </h2>
        <button onClick={() => onAdd("workout", date)}>
          <PlusCircle size={17} /> Adicionar
        </button>
      </div>
      {workoutDay.length ? (
        workoutDay.map((e, i) => entryCard("workout", e, i))
      ) : (
        <div className="diary-empty">
          <Dumbbell />
          <p>Nenhuma atividade registrada neste dia.</p>
        </div>
      )}
      <p className="demo-note">
        Registros desta sessão. Metas e alimentos de exemplo, sem prescrição
        nutricional.
      </p>
    </section>
  );
}
