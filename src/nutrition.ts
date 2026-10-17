export type NutrientKey = "kcal" | "protein" | "carbs" | "fat";
export type FoodCandidate = {
  retrievedAt?: string;
  id: string;
  name: string;
  source: "taco" | "off" | "usda";
  sourceName: string;
  sourceId: string;
  sourceUrl: string;
  sourceVersion: string;
  basis: { amount: 100; unit: "g" | "ml" };
  per100: Record<NutrientKey, number | null>;
  qualifiers: Record<string, string>;
};
export type NutritionReference = {
  food: FoodCandidate;
  amount: number;
  retrievedAt: string;
};
export function parseFoodQuery(input: string): {
  query: string;
  amount?: number;
  unit?: "g" | "ml";
  error?: string;
} {
  const match = input
    .trim()
    .match(
      /^(\d+(?:[.,]\d+)?)\s*(kg|g|gramas?|ml|mililitros?|l|litros?)\b\s*(?:de\s+)?(.+)$/i,
    );
  if (!match) return { query: input.trim() };
  const unit = match[2].toLowerCase();
  const amount =
    Number(match[1].replace(",", ".")) *
    (/^(kg|l|litro)/.test(unit) ? 1000 : 1);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 5000)
    return {
      query: match[3],
      error: "Use uma quantidade maior que zero e de até 5.000 g ou ml.",
    };
  if (/\d\s*(g|kg|ml|l)\b/i.test(match[3]))
    return {
      query: match[3],
      error:
        "Pesquise um alimento por vez. Refeições com vários ingredientes ainda precisam de confirmação manual.",
    };
  return {
    query: match[3],
    amount,
    unit: /^(ml|mililitro|l|litro)/.test(unit) ? "ml" : "g",
  };
}
export function portionValues(food: FoodCandidate, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0 || amount > 5000)
    throw new Error("Quantidade inválida.");
  return Object.fromEntries(
    Object.entries(food.per100).map(([key, value]) => [
      key,
      value === null
        ? null
        : Math.round(((value * amount) / 100) * (key === "kcal" ? 1 : 10)) /
          (key === "kcal" ? 1 : 10),
    ]),
  ) as Record<NutrientKey, number | null>;
}
export function isFoodCandidate(value: unknown): value is FoodCandidate {
  if (!value || typeof value !== "object") return false;
  const food = value as FoodCandidate;
  return (
    typeof food.id === "string" &&
    typeof food.name === "string" &&
    ["taco", "off", "usda"].includes(food.source) &&
    typeof food.sourceName === "string" &&
    typeof food.sourceId === "string" &&
    typeof food.sourceVersion === "string" &&
    /^https:\/\//.test(food.sourceUrl) &&
    food.basis?.amount === 100 &&
    ["g", "ml"].includes(food.basis.unit) &&
    food.per100?.kcal !== null &&
    ["kcal", "protein", "carbs", "fat"].every((key) => {
      const v = food.per100?.[key as NutrientKey];
      return (
        v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0)
      );
    })
  );
}
