import { useEffect, useRef, useState } from "react";
import { Check, Lock, Search, X } from "lucide-react";
import { medalAsset, medalFinishes, type Medal } from "./medalCollection";

export function MedalCatalog({
  medals,
  close,
}: {
  medals: Medal[];
  close: () => void;
}) {
  const [kind, setKind] = useState("Todas");
  const [finish, setFinish] = useState("Todas");
  const [query, setQuery] = useState("");
  const dialog = useRef<HTMLDivElement>(null);
  const onClose = useRef(close);
  onClose.current = close;
  useEffect(() => {
    const oldFocus = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose.current();
      if (event.key !== "Tab") return;
      const focusable = Array.from(
        dialog.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input, select, [tabindex="0"]',
        ) ?? [],
      );
      const first = focusable[0],
        last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
      oldFocus?.focus();
    };
  }, []);
  const groups = Array.from(new Set(medals.map((medal) => medal.design))).map(
    (design) => medals.filter((medal) => medal.design === design),
  );
  const normalized = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  const visible = groups.filter((group) => {
    const first = group[0];
    return (
      (kind === "Todas" || first.kind === kind) &&
      (finish === "Todas" || first.metal === finish) &&
      (!query.trim() ||
        group.some((medal) =>
          normalized(medal.name + " " + medal.description).includes(
            normalized(query.trim()),
          ),
        ))
    );
  });
  return (
    <div
      className="modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        className="modal medal-catalog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-title"
        aria-describedby="catalog-description"
        ref={dialog}
      >
        <button
          className="icon close"
          aria-label="Fechar catálogo"
          onClick={close}
        >
          <X />
        </button>
        <header className="catalog-header">
          <span className="challenge-eyebrow">COLEÇÃO FITIN</span>
          <h2 id="catalog-title">Todas as medalhas</h2>
          <p id="catalog-description">
            {groups.length} ilustrações, {medals.length} medalhas para
            conquistar. Uma mesma ilustração aparece em medalhas com nomes e
            desafios independentes.
          </p>
          <span className="catalog-total">
            {medals.filter((medal) => medal.current >= medal.target).length} de{" "}
            {medals.length} conquistadas
          </span>
        </header>
        <div className="catalog-controls">
          <label className="catalog-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              aria-label="Buscar medalhas"
              placeholder="Buscar nome ou desafio"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="catalog-filters" aria-label="Tipo de ilustração">
            {[
              ["Todas", "Todas"],
              ["medallion", "Medalhas"],
              ["dumbbell", "Halteres"],
            ].map(([value, label]) => (
              <button
                key={value}
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <label className="catalog-finish">
            Acabamento
            <select
              aria-label="Acabamento"
              value={finish}
              onChange={(event) => setFinish(event.target.value)}
            >
              <option value="Todas">Todas as cores</option>
              {medalFinishes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="catalog-results" role="status">
          {visible.length} {visible.length === 1 ? "ilustração" : "ilustrações"}{" "}
          · {visible.reduce((sum, group) => sum + group.length, 0)} medalhas
        </p>
        <div className="catalog-grid">
          {visible.map((group) => {
            const first = group[0];
            const colorName = medalFinishes.find(
              (item) => item.id === first.metal,
            )?.name;
            return (
              <article
                key={first.design}
                className={`catalog-design medal-tone-${first.color}`}
                aria-label={`${first.kind === "medallion" ? "Medalha" : "Haltere"} ${colorName}`}
              >
                <div className="catalog-design-art">
                  <img
                    loading="lazy"
                    src={medalAsset(first.metal, true, first.kind)}
                    alt={`${first.kind === "medallion" ? "Medalha" : "Haltere"} com acabamento ${colorName}`}
                  />
                </div>
                <h3>
                  {first.kind === "medallion" ? "Medalha" : "Haltere"} ·{" "}
                  {colorName}
                </h3>
                <ol className="catalog-names">
                  {group.map((medal) => {
                    const done = medal.current >= medal.target;
                    return (
                      <li
                        key={medal.id}
                        className={`catalog-medal medal-tone-${medal.color} medal-variant-${medal.variant}`}
                      >
                        <span className={`catalog-state ${done ? "done" : ""}`}>
                          {done ? <Check size={15} /> : <Lock size={14} />}
                          <span className="sr-only">
                            {done ? "Conquistada" : "Em progresso"}
                          </span>
                        </span>
                        <img
                          className="catalog-mini-art"
                          src={medalAsset(medal.metal, true, medal.kind)}
                          alt=""
                          loading="lazy"
                        />
                        <div>
                          <h4>{medal.name}</h4>
                          <p>
                            {medal.challenges[0].name}:{" "}
                            {medal.target.toLocaleString("pt-BR")} {medal.unit}
                          </p>
                          <div
                            className="catalog-progress"
                            role="progressbar"
                            aria-label={`Progresso de ${medal.name}`}
                            aria-valuemin={0}
                            aria-valuemax={medal.target}
                            aria-valuenow={Math.min(
                              medal.current,
                              medal.target,
                            )}
                          >
                            <i
                              style={{
                                width: `${Math.min(100, (medal.current / medal.target) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="catalog-records">
                            {Math.min(
                              medal.current,
                              medal.target,
                            ).toLocaleString("pt-BR")}{" "}
                            / {medal.target.toLocaleString("pt-BR")} ·{" "}
                            {medal.xp} XP
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </article>
            );
          })}
        </div>
        {visible.length === 0 && (
          <p className="catalog-empty">
            Nenhuma medalha encontrada. Tente outro nome ou acabamento.
          </p>
        )}
        <p className="catalog-note">
          Medalhas e XP acompanham os registros desta sessão. Conquistar uma
          medalha não exige conquistar as outras com a mesma ilustração.
          Recompensas demonstrativas; sem orientação de saúde.
        </p>
      </div>
    </div>
  );
}
