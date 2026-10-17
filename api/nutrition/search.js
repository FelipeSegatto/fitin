import { createNutritionHandler } from "../../server/nutrition/service.mjs";
// Vercel Node function: the USDA key is read only in the server environment.
export default createNutritionHandler();
