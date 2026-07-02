import { Hono } from "hono";
import * as categoriesController from "../controllers/categories.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types/index.js";

export function createCategoriesRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.use("*", authMiddleware);
  routes.get("/", categoriesController.getCategories);

  return routes;
}
