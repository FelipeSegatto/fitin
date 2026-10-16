import { localDay, type DailyRecord } from "./records";
export type AchievementHistory = {
  days: number;
  meals: number;
  burned: number;
};
export type MedalKind = "medallion" | "dumbbell";
export type MedalChallenge = {
  name: string;
  current: number;
  target: number;
  unit: string;
};
export type Medal = {
  id: string;
  name: string;
  description: string;
  xp: number;
  current: number;
  target: number;
  unit: string;
  metal: string;
  color: string;
  kind: MedalKind;
  design: string;
  variant: number;
  challenges: MedalChallenge[];
};
export const medalFinishes = [
  { id: "bronze", name: "Bronze" },
  { id: "silver", name: "Prata" },
  { id: "gold", name: "Ouro" },
  { id: "diamond", name: "Diamante" },
  { id: "pink", name: "Rosa" },
  { id: "green", name: "Verde" },
] as const;
export function medalAsset(
  metal: string,
  _earned = true,
  kind: MedalKind = "dumbbell",
) {
  if (kind === "medallion")
    return `/assets/achievements/medallion-${metal}.png`;
  if (metal === "pink" || metal === "green")
    return `/assets/medal-${metal}.png`;
  return `/assets/medal-${metal}.svg`;
}
export function achievementSummary(
  streak: number,
  foods: number,
  workoutCalories: number,
  history: AchievementHistory,
  records?: { foods: DailyRecord[]; workouts: DailyRecord[] },
) {
  const today = localDay();
  const actualFoods = (records?.foods ?? []).filter(
    (entry) => entry.date <= today,
  );
  const actualWorkouts = (records?.workouts ?? []).filter(
    (entry) => entry.date <= today,
  );
  const foodDays = new Set(actualFoods.map((entry) => entry.date)).size;
  const activityDays = new Set(actualWorkouts.map((entry) => entry.date)).size;
  const days =
    history.days +
    (records
      ? new Set([...actualFoods, ...actualWorkouts].map((entry) => entry.date))
          .size
      : foods || workoutCalories
        ? 1
        : 0);
  const meals = history.meals + (records ? actualFoods.length : foods);
  const activities = records
    ? actualWorkouts.length
    : workoutCalories > 0
      ? 1
      : 0;
  const calories =
    history.burned +
    (records
      ? actualWorkouts.reduce((sum, entry) => sum + entry.kcal, 0)
      : workoutCalories);
  const task = (
    name: string,
    current: number,
    target: number,
    unit: string,
  ): MedalChallenge => ({ name, current, target, unit });
  const activity = (target: number) =>
    task("Movimento na rotina", activities, target, "atividades");
  const activeDays = (target: number) =>
    task("Dias em movimento", activityDays, target, "dias com atividades");
  const diary = (target: number) =>
    task("Presença no diário", days, target, "dias registrados");
  const meal = (target: number) =>
    task("Refeições registradas", meals, target, "refeições");
  const mealDays = (target: number) =>
    task("Rotina à mesa", foodDays, target, "dias com refeições");
  const sequence = (target: number) =>
    task("Um dia de cada vez", streak, target, "dias seguidos");
  const definitions = [
    {
      id: "workout",
      name: "Treino em dia",
      kind: "dumbbell",
      metal: "bronze",
      color: "coral",
      xp: 100,
      challenges: [activity(1), activeDays(1), diary(3)],
    },
    {
      id: "meals",
      name: "Rotina alimentar",
      kind: "medallion",
      metal: "gold",
      color: "yellow",
      xp: 100,
      challenges: [meal(10), mealDays(3), diary(7)],
    },
    {
      id: "week",
      name: "7 dias seguidos",
      kind: "medallion",
      metal: "silver",
      color: "purple",
      xp: 200,
      challenges: [sequence(7), diary(7), meal(7)],
    },
    {
      id: "focus",
      name: "Foco total",
      kind: "medallion",
      metal: "diamond",
      color: "blue",
      xp: 250,
      challenges: [diary(30), meal(50), sequence(14)],
    },
    {
      id: "energy",
      name: "Grande energia",
      kind: "dumbbell",
      metal: "pink",
      color: "pink",
      xp: 300,
      challenges: [
        task("Energia registrada · demo", calories, 10000, "kcal registradas"),
        activity(5),
        activeDays(3),
      ],
    },
    {
      id: "first",
      name: "Primeiro passo",
      kind: "medallion",
      metal: "bronze",
      color: "mint",
      xp: 50,
      challenges: [meal(1), mealDays(1), diary(1)],
    },
    {
      id: "silver-movement",
      name: "Ritmo constante",
      kind: "dumbbell",
      metal: "silver",
      color: "purple",
      xp: 150,
      challenges: [activity(5), activeDays(3), diary(10)],
    },
    {
      id: "gold-movement",
      name: "Compromisso em movimento",
      kind: "dumbbell",
      metal: "gold",
      color: "yellow",
      xp: 250,
      challenges: [activity(10), activeDays(5), diary(20)],
    },
    {
      id: "diamond-movement",
      name: "Jornada em movimento",
      kind: "dumbbell",
      metal: "diamond",
      color: "blue",
      xp: 400,
      challenges: [activity(25), activeDays(10), diary(45)],
    },
    {
      id: "green-movement",
      name: "Equilíbrio na rotina",
      kind: "dumbbell",
      metal: "green",
      color: "mint",
      xp: 175,
      challenges: [activity(4), activeDays(2), mealDays(5)],
    },
    {
      id: "pink-routine",
      name: "Pequenas vitórias",
      kind: "medallion",
      metal: "pink",
      color: "pink",
      xp: 175,
      challenges: [meal(20), mealDays(5), diary(10)],
    },
    {
      id: "green-routine",
      name: "Hábitos que florescem",
      kind: "medallion",
      metal: "green",
      color: "mint",
      xp: 225,
      challenges: [meal(30), mealDays(10), sequence(14)],
    },
  ] satisfies Omit<
    Medal,
    "description" | "current" | "target" | "unit" | "design" | "variant"
  >[];
  const names: Record<string, string[]> = {
    workout: ["Treino em dia", "Saí do lugar", "Hoje eu fui"],
    meals: ["Rotina alimentar", "Mesa em dia", "Uma semana de cuidado"],
    week: ["7 dias seguidos", "Presença constante", "Diário em dia"],
    focus: ["Foco total", "Rotina consolidada", "Duas semanas comigo"],
    energy: ["Grande energia", "Meu ritmo rosa", "Três dias em movimento"],
    first: ["Primeiro passo", "Primeiro prato", "Jornada iniciada"],
    "silver-movement": [
      "Ritmo constante",
      "Movimento que fica",
      "Dez dias de presença",
    ],
    "gold-movement": [
      "Compromisso em movimento",
      "Cinco dias de ação",
      "Minha rotina dourada",
    ],
    "diamond-movement": [
      "Jornada em movimento",
      "Constância cristalina",
      "Presença de diamante",
    ],
    "green-movement": [
      "Equilíbrio na rotina",
      "Movimento verde",
      "Cuidado à mesa",
    ],
    "pink-routine": [
      "Pequenas vitórias",
      "Minha semana rosa",
      "Cuidado que continua",
    ],
    "green-routine": [
      "Hábitos que florescem",
      "Rotina que cresce",
      "Duas semanas de cuidado",
    ],
  };
  const indexes = Array.from(
    {
      length: Math.max(
        ...definitions.map((design) => design.challenges.length),
      ),
    },
    (_, index) => index,
  );
  const medals: Medal[] = indexes.flatMap((index) =>
    definitions
      .filter((design) => design.challenges[index])
      .map((design) => {
        const challenge = design.challenges[index];
        return {
          ...design,
          variant: index,
          color: [
            design.color,
            {
              coral: "mint",
              yellow: "pink",
              purple: "blue",
              blue: "yellow",
              pink: "purple",
              mint: "coral",
            }[design.color],
            {
              coral: "purple",
              yellow: "blue",
              purple: "mint",
              blue: "pink",
              pink: "yellow",
              mint: "yellow",
            }[design.color],
          ][index]!,
          id: index === 0 ? design.id : `${design.id}-${index + 1}`,
          design: design.id,
          name: names[design.id][index],
          description: `${challenge.name}: registre ${challenge.target.toLocaleString("pt-BR")} ${challenge.unit}. Cada medalha tem seu próprio desafio, mesmo quando compartilha a ilustração.`,
          xp: Math.max(25, Math.round(design.xp / 3 / 25) * 25),
          challenges: [challenge],
          current: challenge.current,
          target: challenge.target,
          unit: challenge.unit,
        };
      }),
  );
  const earned = medals.filter((medal) => medal.current >= medal.target);
  const pending = medals.filter((medal) => medal.current < medal.target);
  const xp = earned.reduce((sum, medal) => sum + medal.xp, 0);
  const levels = [
    { min: 0, max: 100, name: "Iniciante" },
    { min: 100, max: 300, name: "Explorador" },
    { min: 300, max: 700, name: "Colecionador" },
    { min: 700, max: 1200, name: "Atleta" },
    { min: 1200, max: Infinity, name: "Lenda FitIn" },
  ];
  const levelIndex = levels.findIndex((level) => xp < level.max);
  const level = levels[levelIndex];
  const levelProgress = Number.isFinite(level.max)
    ? (xp - level.min) / (level.max - level.min)
    : 1;
  return { medals, earned, pending, xp, level, levelIndex, levelProgress };
}
