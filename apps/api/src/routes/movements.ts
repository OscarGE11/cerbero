import { Hono } from "hono";
import * as movementsController from "../controllers/movements.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types/index.js";

export function createMovementsRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.use("*", authMiddleware);
  routes.get("/summary", movementsController.getMonthSummary);
  routes.get("/", movementsController.getMovements);
  routes.post("/", movementsController.postMovement);
  routes.delete("/:id", movementsController.deleteMovement);

  return routes;
}
