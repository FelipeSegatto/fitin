export type DailyRecord = {
  id: string;
  date: string;
  time: string;
  name: string;
  kcal: number;
  meal?: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  minutes?: number;
};
export type RecordDraft = Omit<DailyRecord, "id" | "date">;
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function localTime(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

let entrySequence = 0;
export function recordId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${++entrySequence}`
  );
}
