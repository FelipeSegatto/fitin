import { createProviders, SourceError } from "./providers.mjs";
import { textKey } from "./normalize.mjs";

// Replace this bounded, source-separated memory cache with Redis when running replicas.
export function createNutritionService({
  providers = createProviders(),
  clock = Date.now,
} = {}) {
  const cache = new Map(),
    inFlight = new Map(),
    nextAllowed = new Map();
  return async function search(source, query) {
    if (!Object.hasOwn(providers, source))
      throw new SourceError("bad_source", "Escolha uma fonte válida.", 400);
    if (
      typeof query !== "string" ||
      query.trim().length < 2 ||
      query.length > 100
    )
      throw new SourceError(
        "bad_query",
        "Digite entre 2 e 100 caracteres.",
        400,
      );
    query = query.trim();
    const key = `${source}:${textKey(query)}`;
    const cached = cache.get(key);
    if (cached && cached.expires > clock())
      return { ...cached.data, cached: true };
    if (inFlight.has(key)) return inFlight.get(key);
    const wait = nextAllowed.get(source) || 0;
    if (source !== "taco" && wait > clock())
      throw new SourceError(
        "rate_limited",
        "Aguarde alguns segundos antes de pesquisar novamente nesta fonte.",
        429,
      );
    nextAllowed.set(source, clock() + (source === "off" ? 6500 : 1500));
    const job = Promise.resolve().then(async () => {
      const foods = await providers[source].search(query);
      const data = {
        version: 1,
        source,
        mode: providers[source].mode,
        foods,
        retrievedAt: new Date(clock()).toISOString(),
        cached: false,
      };
      if (cache.size >= 200) cache.delete(cache.keys().next().value);
      cache.set(key, { data, expires: clock() + 600000 });
      return data;
    });
    inFlight.set(key, job);
    try {
      return await job;
    } finally {
      inFlight.delete(key);
    }
  };
}
export function createNutritionHandler(options) {
  const search = createNutritionService(options);
  return async function handler(req, res) {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      res.statusCode = 405;
      res.end(
        JSON.stringify({
          error: "method",
          message: "Use GET para pesquisar alimentos.",
        }),
      );
      return;
    }
    try {
      const url = new URL(req.url, "http://localhost");
      const data = await search(
        url.searchParams.get("source") || "taco",
        url.searchParams.get("q") || "",
      );
      res.statusCode = 200;
      res.end(JSON.stringify(data));
    } catch (error) {
      res.statusCode = error instanceof SourceError ? error.status : 503;
      res.end(
        JSON.stringify({
          error: error instanceof SourceError ? error.code : "unavailable",
          message:
            error instanceof SourceError
              ? error.message
              : "Busca indisponível. O registro manual continua disponível.",
        }),
      );
    }
  };
}
