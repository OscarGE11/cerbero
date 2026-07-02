import { Hono } from "hono";
import * as linkCodesController from "../controllers/link-codes.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types/index.js";

export function createLinkCodesRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.use("*", authMiddleware);
  routes.post("/", linkCodesController.postLinkCode);

  return routes;
}
