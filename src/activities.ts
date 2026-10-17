// Small, manually selected factual MET reference; no third-party exercise API.
// Ainsworth et al., 2011 Compendium of Physical Activities.
export const activitySource = {
  name: "Compêndio de Atividades Físicas · 2011",
  url: "https://doi.org/10.1249/MSS.0b013e31821ece12",
  version: "2011",
};
export const activityOptions = [
  { id: "walking-usual", name: "Caminhada", detail: "Em piso plano, aproximadamente 4,5 a 5,1 km/h", intensity: "Moderada", met: 3.5 },
  { id: "walking-brisk", name: "Caminhada", detail: "Em piso plano, aproximadamente 5,6 km/h", intensity: "Moderada", met: 4.3 },
  { id: "cycling-leisure", name: "Bicicleta", detail: "Passeio, abaixo de 16 km/h", intensity: "Moderada", met: 4 },
  { id: "cycling-moderate", name: "Bicicleta", detail: "16 a 19 km/h", intensity: "Vigorosa", met: 6.8 },
  { id: "cycling-fast", name: "Bicicleta", detail: "19 a 22 km/h", intensity: "Vigorosa", met: 8 },
  { id: "running-8", name: "Corrida", detail: "Aproximadamente 8 km/h", intensity: "Vigorosa", met: 8.3 },
  { id: "running-9.7", name: "Corrida", detail: "Aproximadamente 9,7 km/h", intensity: "Vigorosa", met: 9.8 },
  { id: "strength-multiple", name: "Musculação", detail: "Vários exercícios, séries de 8 a 15 repetições", intensity: "Moderada", met: 3.5 },
  { id: "strength-vigorous", name: "Musculação", detail: "Esforço vigoroso", intensity: "Vigorosa", met: 6 },
  { id: "stretching", name: "Alongamento", detail: "Alongamento leve", intensity: "Leve", met: 2.3 },
  { id: "yoga-hatha", name: "Yoga", detail: "Hatha yoga", intensity: "Leve", met: 2.5 },
] as const;
export type ActivityReference = {
  activityId: string;
  name: string;
  detail: string;
  intensity: string;
  met: number;
  weightKg: number;
  minutes: number;
  kcal: number;
  method: "net-met-v1";
  source: typeof activitySource;
};
export function estimateActivity(activityId: string, weightKg: number, minutes: number): ActivityReference {
  const activity = activityOptions.find(item => item.id === activityId);
  if (!activity || !Number.isFinite(weightKg) || weightKg < 20 || weightKg > 350 || !Number.isFinite(minutes) || !Number.isInteger(minutes) || minutes < 1 || minutes > 1440)
    throw new Error("Confira a atividade, o peso e a duração.");
  // Active energy only: subtract 1 MET of resting expenditure to avoid adding it twice.
  const kcal = Math.round((activity.met - 1) * 3.5 * weightKg / 200 * minutes);
  if (kcal < 1 || kcal > 10000) throw new Error("A estimativa está fora do limite do registro. Confira os valores.");
  return {activityId: activity.id, name: activity.name, detail: activity.detail, intensity: activity.intensity, met: activity.met, weightKg, minutes, kcal, method: "net-met-v1", source: activitySource};
}
export function weightAtDate(weights: {date: string; weight: number}[], date: string): number | undefined {
  return [...weights].filter(w => w.date <= date && Number.isFinite(w.weight) && w.weight >= 20 && w.weight <= 350).sort((a,b) => b.date.localeCompare(a.date))[0]?.weight;
}
