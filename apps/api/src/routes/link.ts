import { Hono } from "hono";
import * as linkPageController from "../controllers/link-page.js";
import type { AppVariables } from "../types/index.js";

export function createLinkRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.get("/sessions/status", linkPageController.getLinkSessionStatus);
  routes.get("/", linkPageController.getLinkPage);
  routes.post(
    "/sessions/complete",
    linkPageController.linkCompleteAuth,
    linkPageController.postLinkSessionComplete,
  );

  return routes;
}
