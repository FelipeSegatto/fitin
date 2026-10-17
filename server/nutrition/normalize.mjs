export function numberOrNull(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && !value.trim()) ||
    typeof value === "boolean"
  )
    return null;
  const number =
    typeof value === "number"
      ? value
      : Number(String(value).trim().replace(",", "."));
  return Number.isFinite(number) && number >= 0 ? number : null;
}
export const textKey = (value) =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
export function normalizedFood({
  source,
  sourceName,
  sourceId,
  name,
  per100,
  unit = "g",
  url,
  version,
  qualifiers = {},
}) {
  const values = Object.fromEntries(
    ["kcal", "protein", "carbs", "fat"].map((key) => [
      key,
      numberOrNull(per100[key]),
    ]),
  );
  if (typeof name !== "string" || !name.trim() || sourceId === undefined || sourceId === null || String(sourceId).trim() === "" || values.kcal === null) return null;
  return {
    id: `${source}:${sourceId}`,
    name: name.trim(),
    source,
    sourceName,
    sourceId: String(sourceId),
    sourceUrl: url,
    sourceVersion: version,
    basis: { amount: 100, unit },
    per100: values,
    qualifiers,
  };
}
export function normalizeOff(product) {
  if (!product || typeof product !== "object") return null;
  const n = product.nutriments || {};
  const unit =
    product.product_quantity_unit === "ml" ||
    /\d\s*(?:ml|cl|l)\b/i.test(product.quantity || "")
      ? "ml"
      : "g";
  return normalizedFood({
    source: "off",
    sourceName: "Open Food Facts",
    sourceId: product.code,
    name: product.product_name_pt || product.product_name,
    unit,
    url: `https://world.openfoodfacts.org/product/${encodeURIComponent(product.code)}`,
    version: "API v2 / search v1",
    per100: {
      kcal:
        numberOrNull(n["energy-kcal_100g"]) ??
        (numberOrNull(n.energy_100g) !== null
          ? numberOrNull(n.energy_100g) / (String(n.energy_unit).toLowerCase() === "kcal" ? 1 : 4.184)
          : null),
      protein: n.proteins_100g,
      carbs: n.carbohydrates_100g,
      fat: n.fat_100g,
    },
  });
}
export function normalizeUsda(food) {
  if (!food || !Array.isArray(food.foodNutrients)) return null;
  const nutrients = food.foodNutrients;
  const value = (ids, unit) => {
    for (const id of ids) {
      const found = nutrients.find(
        (entry) =>
          Number(entry.nutrientId) === id &&
          String(entry.unitName).toUpperCase() === unit,
      );
      const number = numberOrNull(found?.value);
      if (number !== null) return number;
    }
    return null;
  };
  const kcal = value([1008, 2047, 2048], "KCAL");
  const kj = value([1062], "KJ");
  return normalizedFood({
    source: "usda",
    sourceName: "USDA FoodData Central",
    sourceId: food.fdcId,
    name: food.description,
    url: `https://fdc.nal.usda.gov/food-details/${encodeURIComponent(food.fdcId)}/nutrients`,
    version: "FDC API v1",
    per100: {
      kcal: kcal ?? (kj === null ? null : kj / 4.184),
      protein: value([1003], "G"),
      carbs: value([1005], "G"),
      fat: value([1004], "G"),
    },
  });
}
