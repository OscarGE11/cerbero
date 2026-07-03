import { Hono } from "hono";
import * as userCategoriesController from "../controllers/user-categories.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types/index.js";

export function createUserCategoriesRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.use("*", authMiddleware);
  routes.get("/", userCategoriesController.getUserCategories);

  return routes;
}
