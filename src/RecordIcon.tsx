import {
  Apple,
  Bike,
  Coffee,
  CookingPot,
  Dumbbell,
  Fish,
  Footprints,
  GlassWater,
  HeartPulse,
  Milk,
  Moon,
  Music2,
  PersonStanding,
  Salad,
  Sandwich,
  UtensilsCrossed,
  Waves,
  Wheat,
} from "lucide-react";
import type { DailyRecord } from "./records";

export function RecordIcon({
  record,
  kind,
}: {
  record: DailyRecord;
  kind: "food" | "workout";
}) {
  const name = record.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const meal = (record.meal || "").toLowerCase();
  const Icon =
    kind === "workout"
      ? /caminh|corrida|correr/.test(name)
        ? Footprints
        : /muscula|forca|peso|halter/.test(name)
          ? Dumbbell
          : /mobilidade|along|yoga|pilates/.test(name)
            ? PersonStanding
            : /bike|bicicl|cicl|pedal/.test(name)
              ? Bike
              : /natacao|nadar|piscina/.test(name)
                ? Waves
                : /danca|zumba/.test(name)
                  ? Music2
                  : HeartPulse
      : /ceia/.test(meal)
        ? Moon
        : /café|cafe/.test(meal)
          ? Coffee
          : /sanduiche|sanduich|torrada/.test(name)
            ? Sandwich
            : /peixe|salmao|atum/.test(name)
              ? Fish
              : /almoco|almoço/.test(meal) || /salada/.test(name)
                ? Salad
                : /jantar/.test(meal)
                  ? CookingPot
                  : /fruta|banana|maca|laranja|morango/.test(name)
                    ? Apple
                    : /iogurte|leite|queijo/.test(name)
                      ? Milk
                      : /pao|aveia|cereal/.test(name)
                        ? Wheat
                        : /agua|suco/.test(name)
                          ? GlassWater
                          : UtensilsCrossed;
  return <Icon size={18} strokeWidth={1.8} aria-hidden="true" />;
}
