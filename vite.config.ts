import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { createNutritionHandler } from "./server/nutrition/service.mjs";
import { createProviders } from "./server/nutrition/providers.mjs";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "USDA_");
  const handler = createNutritionHandler({
    providers: createProviders({
      usdaKey: process.env.USDA_API_KEY || env.USDA_API_KEY || "DEMO_KEY",
    }),
  });
  return {
    plugins: [
      react(),
      {
        name: "fitin-nutrition-api",
        configureServer(server) {
          server.middlewares.use("/api/nutrition/search", handler);
        },
        configurePreviewServer(server) {
          server.middlewares.use("/api/nutrition/search", handler);
        },
      },
    ],
  };
});
