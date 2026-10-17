import { useEffect, useRef, useState } from "react";
import { ChevronDown, LoaderCircle, Search } from "lucide-react";
import {
  isFoodCandidate,
  parseFoodQuery,
  portionValues,
  type FoodCandidate,
  type NutritionReference,
} from "./nutrition";
import "./nutrition.css";

export function FoodSearch({
  onApply,
}: {
  onApply: (reference: NutritionReference) => void;
}) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState(""),
    [source, setSource] = useState("taco");
  const [results, setResults] = useState<FoodCandidate[]>([]),
    [selected, setSelected] = useState<FoodCandidate | null>(null);
  const [amount, setAmount] = useState("100"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [retrievedAt, setRetrievedAt] = useState("");
  const controller = useRef<AbortController | null>(null);
  const hint = useRef<ReturnType<typeof parseFoodQuery>>({ query: "" });
  useEffect(() => () => controller.current?.abort(), []);
  const reset = () => {
    controller.current?.abort();
    setBusy(false);
    setResults([]);
    setSelected(null);
    setMessage("");
  };
  const search = async () => {
    const parsed = parseFoodQuery(query);
    hint.current = parsed;
    if (parsed.error) {
      setMessage(parsed.error);
      return;
    }
    if (parsed.query.length < 2 || parsed.query.length > 100) {
      setMessage("Digite entre 2 e 100 caracteres para buscar.");
      return;
    }
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setBusy(true);
    setSelected(null);
    setResults([]);
    setMessage("");
    try {
      const response = await fetch(
        `/api/nutrition/search?${new URLSearchParams({ source, q: parsed.query })}`,
        { signal: request.signal },
      );
      const data = await response.json();
      if (request.signal.aborted) return;
      if (!response.ok) {
        setMessage(
          typeof data.message === "string"
            ? data.message
            : "Busca indisponível. O registro manual continua disponível.",
        );
        return;
      }
      if (
        data.version !== 1 ||
        data.source !== source ||
        !Array.isArray(data.foods)
      )
        throw new Error("Invalid response");
      const foods = data.foods
        .filter(isFoodCandidate)
        .filter((food: FoodCandidate) => food.source === source);
      setResults(foods);
      setRetrievedAt(data.retrievedAt);
      setMessage(
        foods.length
          ? `${foods.length} resultados. Confira o alimento e a forma de preparo antes de selecionar.`
          : "Nenhum alimento encontrado. Tente outro nome ou preencha manualmente.",
      );
    } catch {
      if (!request.signal.aborted)
        setMessage(
          "Não foi possível consultar a fonte. Confira a conexão ou registre manualmente.",
        );
    } finally {
      if (!request.signal.aborted) setBusy(false);
    }
  };
  const values =
    selected && Number(amount) > 0 && Number(amount) <= 5000
      ? portionValues(selected, Number(amount))
      : null;
  return (
    <section className="food-search">
      <button
        className="food-search-toggle"
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (open) reset();
        }}
      >
        <Search size={17} />
        Buscar na base nutricional
        <ChevronDown size={16} />
      </button>
      {open && (
        <div className="food-search-panel">
          <label className="field">
            <span>Fonte nutricional</span>
            <select
              value={source}
              onChange={(event) => {
                reset();
                setSource(event.target.value);
              }}
            >
              <option value="taco">TACO · alimentos brasileiros</option>
              <option value="off">
                Open Food Facts · produtos e código de barras
              </option>
              <option value="usda">USDA · ingredientes em inglês</option>
            </select>
          </label>
          <p className="food-source-note">
            {source === "taco"
              ? "Acervo local de 597 alimentos da TACO (2011). Não é uma consulta à TBCA nem uma API oficial da TACO."
              : source === "off"
                ? "Base colaborativa: confira o produto, a marca e os valores do rótulo. Você também pode digitar um código de barras."
                : "Dados do USDA. Busque em inglês, como “cooked rice”. O acesso de demonstração tem limite de consultas."}
          </p>
          <label className="field">
            <span>Buscar alimento ou código de barras</span>
            <input
              type="search"
              maxLength={120}
              value={query}
              placeholder="Ex.: 150 g de arroz cozido"
              onChange={(event) => {
                reset();
                setQuery(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void search();
                }
              }}
            />
          </label>
          <button
            type="button"
            className="food-search-submit"
            disabled={busy}
            onClick={() => void search()}
          >
            {busy ? (
              <>
                <LoaderCircle className="spin" size={16} />
                Buscando…
              </>
            ) : (
              "Pesquisar alimentos"
            )}
          </button>
          <p className="food-search-status" role="status">
            {message}
          </p>
          <div className="food-search-results">
            {results.map((food) => (
              <button
                type="button"
                key={food.id}
                aria-pressed={selected?.id === food.id}
                onClick={() => {
                  setSelected(food);
                  setAmount(
                    String(
                      hint.current.unit === food.basis.unit &&
                        hint.current.amount
                        ? hint.current.amount
                        : 100,
                    ),
                  );
                }}
              >
                <strong>{food.name}</strong>
                <span>
                  {food.sourceName} · {Math.round(food.per100.kcal!)} kcal / 100{" "}
                  {food.basis.unit}
                </span>
              </button>
            ))}
          </div>
          {selected && (
            <div className="food-portion">
              <h3>Confirmar porção</h3>
              <p>{selected.name}</p>
              <label className="field">
                <span>Quantidade ({selected.basis.unit})</span>
                <input
                  type="number"
                  min="0.1"
                  max="5000"
                  step="0.1"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                />
              </label>
              {values && (
                <p className="food-portion-values">
                  {values.kcal} kcal · P {values.protein ?? "—"} g · C{" "}
                  {values.carbs ?? "—"} g · G {values.fat ?? "—"} g
                </p>
              )}
              <button
                type="button"
                className="food-search-submit"
                disabled={
                  !values || values.kcal === null || values.kcal > 10000
                }
                onClick={() => {
                  if (values && values.kcal !== null && values.kcal <= 10000) {
                    onApply({
                      food: selected,
                      amount: Number(amount),
                      retrievedAt,
                    });
                    setOpen(false);
                    reset();
                  }
                }}
              >
                Usar alimento
              </button>
              <small>
                Valores proporcionais à quantidade informada. Medidas como “um
                prato” não são convertidas automaticamente.
              </small>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
