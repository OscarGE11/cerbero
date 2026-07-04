import { Hono } from "hono";
import * as authController from "../controllers/auth.js";

export function createAuthRoutes() {
  const routes = new Hono();

  routes.post("/forgot-password", authController.postForgotPassword);

  return routes;
}
