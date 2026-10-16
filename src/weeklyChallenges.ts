import { localDay, type DailyRecord } from "./records";

export type ChallengeSelection = { id: string; week: string };
export const weeklyChallenges = [
  {
    id: "meals",
    name: "Mesa em dia",
    description: "Registre refeições em 3 dias diferentes.",
    target: 3,
    unit: "dias com refeições",
    reward: "Mesa em dia",
    color: "mint",
  },
  {
    id: "activities",
    name: "Movimento na rotina",
    description: "Registre 2 atividades, no seu ritmo.",
    target: 2,
    unit: "atividades",
    reward: "Em movimento",
    color: "purple",
  },
  {
    id: "weight",
    name: "Um momento para acompanhar",
    description: "Registre seu peso uma vez, sem meta de ganho ou perda.",
    target: 1,
    unit: "registro de peso",
    reward: "Meu acompanhamento",
    color: "blue",
  },
  {
    id: "days",
    name: "Pequenos passos",
    description: "Registre refeições ou atividades em 5 dias diferentes.",
    target: 5,
    unit: "dias com registros",
    reward: "Cada dia conta",
    color: "yellow",
  },
] as const;

export function challengeWeek(now = new Date()) {
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return {
    start: localDay(monday),
    end: localDay(sunday),
    today: localDay(now),
  };
}

export function weeklyProgress(
  foods: DailyRecord[],
  workouts: DailyRecord[],
  weights: { date: string; weight: number }[],
  now = new Date(),
): Record<string, number> {
  const week = challengeWeek(now);
  const inWeek = (record: { date: string }) =>
    record.date >= week.start && record.date <= week.today;
  const meals = foods.filter(inWeek),
    activities = workouts.filter(inWeek);
  return {
    meals: new Set(meals.map((record) => record.date)).size,
    activities: activities.length,
    weight: weights.some(inWeek) ? 1 : 0,
    days: new Set([...meals, ...activities].map((record) => record.date)).size,
  };
}
