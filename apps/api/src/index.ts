import { Hono } from "hono";
import { cors } from "hono/cors";
import { env } from "./config/env.js";
import { createCategoriesRoutes } from "./routes/categories.js";
import { createLinkCodesRoutes } from "./routes/link-codes.js";
import { createLinkRoutes } from "./routes/link.js";
import { createMovementsRoutes } from "./routes/movements.js";

export function createApp() {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: "*",
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.get("/health", (c) => c.json({ status: "ok" }));

  app.route("/link", createLinkRoutes());
  app.route("/categories", createCategoriesRoutes());
  app.route("/movements", createMovementsRoutes());
  app.route("/link-codes", createLinkCodesRoutes());

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  return app;
}

export function startServer() {
  const app = createApp();

  console.log(`Cerbero API listening on http://localhost:${env.PORT}`);

  return Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
  });
}

if (import.meta.main) {
  startServer();
}
