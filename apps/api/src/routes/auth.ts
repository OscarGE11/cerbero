import { Hono } from "hono";
import * as authController from "../controllers/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";

export function createAuthRoutes() {
  const routes = new Hono();

  routes.post(
    "/forgot-password",
    rateLimit({
      limit: 5,
      windowMs: 15 * 60 * 1000,
      keyPrefix: "forgot-password",
    }),
    authController.postForgotPassword,
  );

  return routes;
}
