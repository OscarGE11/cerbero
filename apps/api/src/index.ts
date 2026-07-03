import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Telegraf } from "telegraf";
import { createBotOrNull, launchBot, registerBotWebhook } from "./bot/index.js";
import type { BotContext } from "./bot/types.js";
import { env, isProduction } from "./config/env.js";
import {
  getPublicApiUrl,
  resolveReachablePublicApiUrl,
} from "./config/public-url.js";
import { createCategoriesRoutes } from "./routes/categories.js";
import { createLinkCodesRoutes } from "./routes/link-codes.js";
import { createLinkRoutes } from "./routes/link.js";
import { createMovementsRoutes } from "./routes/movements.js";
import { createUserCategoriesRoutes } from "./routes/user-categories.js";

export function createApp(bot?: Telegraf<BotContext> | null) {
  const app = new Hono();

  app.use(
    "*",
    cors({
      origin: isProduction
        ? env.CORS_ORIGIN
        : [env.CORS_ORIGIN, "http://localhost:3000"],
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["GET", "POST", "OPTIONS"],
    }),
  );

  app.get("/health", async (c) => {
    const payload: Record<string, unknown> = {
      status: "ok",
      env: env.NODE_ENV,
    };

    if (bot && isProduction) {
      try {
        const info = await bot.telegram.getWebhookInfo();
        payload.telegram = {
          webhookUrl: info.url || null,
          expectedWebhookUrl: `${getPublicApiUrl()}/telegram/webhook`,
          pendingUpdates: info.pending_update_count,
          lastError: info.last_error_message ?? null,
        };
      } catch (error) {
        console.error("getWebhookInfo failed:", error);
        payload.telegram = { error: "getWebhookInfo failed" };
      }
    }

    return c.json(payload);
  });

  if (bot && isProduction) {
    registerBotWebhook(app, bot);
  }

  app.route("/link", createLinkRoutes());
  app.route("/categories", createCategoriesRoutes());
  app.route("/user-categories", createUserCategoriesRoutes());
  app.route("/movements", createMovementsRoutes());
  app.route("/link-codes", createLinkCodesRoutes());

  app.notFound((c) => c.json({ error: "Not found" }, 404));

  return app;
}

export function startServer(app: Hono) {
  const label = isProduction
    ? env.PUBLIC_API_URL
    : `http://localhost:${env.PORT}`;

  console.log(`Cerbero API listening on ${label}`);

  return Bun.serve({
    port: env.PORT,
    fetch: app.fetch,
  });
}

async function main() {
  const bot = createBotOrNull();

  if (bot && isProduction) {
    await resolveReachablePublicApiUrl();
  }

  const app = createApp(bot);
  const server = startServer(app);

  if (bot) {
    await launchBot(bot);
  }

  async function shutdown() {
    console.log("\nCerrando servidor limpiamente...");
    if (bot) {
      bot.stop("SIGINT");
    }
    server.stop();
    process.exit(0);
  }

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

if (import.meta.main) {
  void main();
}
