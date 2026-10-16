import { localDay, type DailyRecord } from "./records";

// Fictional examples for reviewing a populated day, not a nutrition or activity plan.
export function fullDayRecords(): {
  foods: DailyRecord[];
  workouts: DailyRecord[];
} {
  const date = localDay();
  return {
    foods: [
      {
        id: "full-breakfast",
        date,
        time: "07:30",
        meal: "Café da manhã",
        name: "Ovos, aveia e banana",
        kcal: 390,
        protein: 25,
        carbs: 50,
        fat: 10,
      },
      {
        id: "full-morning-snack",
        date,
        time: "10:00",
        meal: "Lanche",
        name: "Iogurte, fruta e castanhas",
        kcal: 232,
        protein: 15,
        carbs: 25,
        fat: 8,
      },
      {
        id: "full-lunch",
        date,
        time: "12:30",
        meal: "Almoço",
        name: "Arroz, feijão, frango e salada",
        kcal: 660,
        protein: 40,
        carbs: 80,
        fat: 20,
      },
      {
        id: "full-afternoon-snack",
        date,
        time: "16:00",
        meal: "Lanche",
        name: "Sanduíche integral com queijo",
        kcal: 310,
        protein: 20,
        carbs: 35,
        fat: 10,
      },
      {
        id: "full-dinner",
        date,
        time: "19:30",
        meal: "Jantar",
        name: "Peixe, batata e legumes",
        kcal: 524,
        protein: 30,
        carbs: 65,
        fat: 16,
      },
      {
        id: "full-supper",
        date,
        time: "21:30",
        meal: "Ceia",
        name: "Iogurte, aveia e castanhas",
        kcal: 284,
        protein: 10,
        carbs: 25,
        fat: 16,
      },
    ],
    workouts: [
      {
        id: "full-walk",
        date,
        time: "06:30",
        name: "Caminhada ao ar livre",
        kcal: 170,
        minutes: 35,
      },
      {
        id: "full-strength",
        date,
        time: "17:30",
        name: "Musculação",
        kcal: 150,
        minutes: 40,
      },
      {
        id: "full-mobility",
        date,
        time: "20:30",
        name: "Mobilidade e alongamento",
        kcal: 80,
        minutes: 20,
      },
    ],
  };
}
