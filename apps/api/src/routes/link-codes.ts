import { Hono } from "hono";
import * as linkCodesController from "../controllers/link-codes.js";
import { authMiddleware } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";
import type { AppVariables } from "../types/index.js";

export function createLinkCodesRoutes() {
  const routes = new Hono<{ Variables: AppVariables }>();

  routes.use("*", authMiddleware);
  routes.post(
    "/",
    rateLimit({
      limit: 10,
      windowMs: 10 * 60 * 1000,
      keyPrefix: "link-codes",
    }),
    linkCodesController.postLinkCode,
  );

  return routes;
}
