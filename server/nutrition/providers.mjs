import dataset from "./data/taco.json" with { type: "json" };
import {
  normalizeOff,
  normalizeUsda,
  normalizedFood,
  textKey,
} from "./normalize.mjs";

export class SourceError extends Error {
  constructor(code, message, status = 503) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
export function createProviders({
  fetchImpl = fetch,
  usdaKey = process.env.USDA_API_KEY || "DEMO_KEY",
} = {}) {
  async function request(url) {
    let response;
    try {
      response = await fetchImpl(url, {
        headers: {
          "User-Agent":
            "FitInDemo/0.1 (nutrition search; https://github.com/FelipeSegatto/fitin)",
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(8000),
        redirect: "error",
      });
    } catch {
      throw new SourceError(
        "unavailable",
        "A fonte não respondeu. Tente outra fonte ou preencha manualmente.",
      );
    }
    if (response.status === 429)
      throw new SourceError(
        "rate_limited",
        "O limite de consultas desta fonte foi atingido. Aguarde ou use outra fonte.",
        429,
      );
    if ([401, 403].includes(response.status))
      throw new SourceError(
        "access_denied",
        "O acesso à fonte não está disponível. No USDA, confira a chave no servidor.",
      );
    if (!response.ok)
      throw new SourceError(
        "unavailable",
        "A fonte está indisponível. Você pode usar outra fonte ou registrar manualmente.",
      );
    try {
      return await response.json();
    } catch {
      throw new SourceError(
        "invalid_response",
        "A fonte enviou uma resposta inválida. Tente outra fonte.",
      );
    }
  }
  return {
    taco: {
      mode: "local",
      async search(query) {
        const words = textKey(query)
          .split(/\s+/)
          .filter((word) => !["de", "do", "da", "com", "e"].includes(word));
        return dataset.foods
          .filter((food) =>
            words.every((word) => textKey(food.name).includes(word)),
          )
          .slice(0, 8)
          .map((food) =>
            normalizedFood({
              source: "taco",
              sourceName: "TACO · acervo local",
              sourceId: food.id,
              name: food.name,
              url: "https://www.nepa.unicamp.br/taco/",
              version: dataset.version,
              per100: food,
              qualifiers: Object.fromEntries(
                ["protein", "carbs", "fat"]
                  .filter(
                    (key) => typeof food[key] === "string" && food[key].trim(),
                  )
                  .map((key) => [key, food[key]]),
              ),
            }),
          )
          .filter(Boolean);
      },
    },
    off: {
      mode: "live",
      async search(query) {
        const barcode = /^\d{8,14}$/.test(query);
        const url = new URL(
          barcode ? `/api/v2/product/${query}.json` : "/cgi/search.pl",
          "https://world.openfoodfacts.org",
        );
        url.searchParams.set(
          "fields",
          "code,product_name,product_name_pt,nutriments,product_quantity_unit,quantity",
        );
        if (!barcode)
          Object.entries({
            search_terms: query,
            search_simple: "1",
            action: "process",
            json: "1",
            page_size: "8",
            lc: "pt",
            cc: "br",
          }).forEach(([key, value]) => url.searchParams.set(key, value));
        const data = await request(url);
        return (
          barcode
            ? data.status === 1
              ? [{ ...data.product, code: data.product?.code || data.code || query }]
              : []
            : data.products || []
        )
          .map(normalizeOff)
          .filter(Boolean);
      },
    },
    usda: {
      mode: usdaKey === "DEMO_KEY" ? "demo-key" : "live",
      async search(query) {
        const url = new URL("https://api.nal.usda.gov/fdc/v1/foods/search");
        Object.entries({
          api_key: usdaKey,
          query,
          pageSize: "8",
          dataType: "Foundation,SR Legacy",
        }).forEach(([key, value]) => url.searchParams.set(key, value));
        const data = await request(url);
        return (data.foods || []).map(normalizeUsda).filter(Boolean);
      },
    },
  };
}
