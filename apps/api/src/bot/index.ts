import type { Hono } from "hono";
import { Scenes, Telegraf, session } from "telegraf";
import { env, isProduction } from "../config/env.js";
import { getPublicApiUrl } from "../config/public-url.js";
import { createAdminSupabase } from "../config/supabase.js";
import * as linkSessionsService from "../services/link-sessions.js";
import * as movementsService from "../services/movements.js";
import * as telegramService from "../services/telegram.js";
import { loadLinkedUser, requireLinked } from "./middleware/auth.js";
import { addMovementScene } from "./scenes/addMovement.js";
import type { BotContext, BotContextWithState, SessionData } from "./types.js";

import { formatCurrency } from "../lib/format.js";
import {
  formatAlreadyLinkedMessage,
  formatLinkSuccessMessage,
  formatStartMessage,
  getDashboardUrl,
} from "./lib/messages.js";

async function handleStart(ctx: BotContextWithState) {
  await ctx.reply(formatStartMessage(Boolean(ctx.state.linkedUser)));
}

async function handleLogin(ctx: BotContextWithState) {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("No se pudo identificar tu cuenta de Telegram.");
    return;
  }

  if (ctx.state.linkedUser) {
    await ctx.reply(formatAlreadyLinkedMessage());
    return;
  }

  try {
    const supabase = createAdminSupabase();
    const { url } = await linkSessionsService.startLoginSession(supabase, {
      telegramId,
      telegramUsername: ctx.from?.username,
    });

    await ctx.reply(
      [
        "Abre este enlace para registrarte o iniciar sesión:",
        url,
        "",
        "Al terminar verás un código OTP de 6 dígitos.",
        "Vuelve aquí y envía:",
        "/link TU_CODIGO",
      ].join("\n"),
    );
  } catch (error) {
    console.error("handleLogin failed:", error);
    await ctx.reply("No se pudo crear el enlace. Inténtalo de nuevo.");
  }
}

async function handleLink(ctx: BotContextWithState) {
  const message = ctx.message;
  if (!message || !("text" in message)) {
    return;
  }

  const parts = message.text.trim().split(/\s+/);
  const code = parts[1];

  if (!code) {
    await ctx.reply(
      [
        "Para vincular tu cuenta:",
        "",
        "1. /login — Obtén el enlace web y el código OTP",
        "2. /link TU_CODIGO — Pega aquí el código de 6 dígitos",
      ].join("\n"),
    );
    return;
  }

  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("No se pudo identificar tu cuenta de Telegram.");
    return;
  }

  if (ctx.state.linkedUser) {
    await ctx.reply(formatAlreadyLinkedMessage());
    return;
  }

  try {
    const supabase = createAdminSupabase();
    await telegramService.linkTelegramWithCode(supabase, {
      code,
      telegramId,
      telegramUsername: ctx.from?.username,
    });
    ctx.state.linkedUser = await telegramService.getLinkedUser(
      supabase,
      telegramId,
    );
    await ctx.reply(formatLinkSuccessMessage());
  } catch (error) {
    const messageText =
      error instanceof Error && error.message === "INVALID_OR_EXPIRED_CODE"
        ? "Código inválido o expirado. Usa /login para generar uno nuevo."
        : error instanceof Error && error.message === "TELEGRAM_MISMATCH"
          ? "Este código pertenece a otra cuenta de Telegram. Usa /login desde tu Telegram."
          : error instanceof Error &&
              error.message === "TELEGRAM_ALREADY_LINKED"
            ? "Este Telegram ya está vinculado a otra cuenta."
            : "No se pudo vincular la cuenta. Inténtalo de nuevo.";

    await ctx.reply(messageText);
  }
}

async function handleLast(ctx: BotContextWithState) {
  const linkedUser = ctx.state.linkedUser;
  if (!linkedUser) return;

  const supabase = createAdminSupabase();
  const movements = await movementsService.listMovements(
    supabase,
    linkedUser.userId,
    { limit: 5 },
  );

  if (movements.length === 0) {
    await ctx.reply(
      "No tienes movimientos todavía.\n\nUsa /add para crear uno o /dashboard para el panel web.",
    );
    return;
  }

  const lines = movements.map((m) => {
    const sign = m.type === "income" ? "+" : "-";
    return `${sign} ${formatCurrency(m.amount)} · ${m.title} (${m.date})`;
  });

  await ctx.reply(
    ["Últimos 5 movimientos:", "", ...lines, "", "Ver todo: /dashboard"].join(
      "\n",
    ),
  );
}

async function handleMonth(ctx: BotContextWithState) {
  const linkedUser = ctx.state.linkedUser;
  if (!linkedUser) return;

  const supabase = createAdminSupabase();
  const summary = await movementsService.getMonthSummary(
    supabase,
    linkedUser.userId,
  );

  await ctx.reply(
    [
      `Resumen de ${summary.month}:`,
      `• Gastos: ${formatCurrency(summary.expenses)}`,
      `• Ingresos: ${formatCurrency(summary.income)}`,
      `• Balance: ${formatCurrency(summary.balance)}`,
      "",
      "Detalle en el panel: /dashboard",
    ].join("\n"),
  );
}

async function handleDashboard(ctx: BotContextWithState) {
  if (!ctx.state.linkedUser) return;

  const url = getDashboardUrl();
  await ctx.reply(
    [
      "Tu panel de Cerbero:",
      url,
      "",
      "Ahí puedes ver gráficos, filtrar movimientos y eliminar registros.",
      "",
      "Comandos de Telegram: /start",
    ].join("\n"),
  );
}

async function handleUnlink(ctx: BotContextWithState) {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("No se pudo identificar tu cuenta de Telegram.");
    return;
  }

  const message = ctx.message;
  if (!message || !("text" in message)) {
    return;
  }

  const parts = message.text.trim().split(/\s+/);
  const confirm = parts[1]?.toLowerCase() === "confirm";

  if (!ctx.state.linkedUser) {
    await ctx.reply("Tu Telegram no está vinculado. Usa /login para empezar.");
    return;
  }

  if (!confirm) {
    await ctx.reply(
      [
        "Esto desvinculará tu Telegram de Cerbero.",
        "Tus movimientos en la web no se borran.",
        "",
        "Para confirmar: /unlink confirm",
      ].join("\n"),
    );
    return;
  }

  try {
    if (ctx.scene.current) {
      (ctx.session as SessionData).movementDraft = undefined;
      await ctx.scene.leave();
    }

    const supabase = createAdminSupabase();
    await telegramService.unlinkTelegram(supabase, telegramId);
    ctx.state.linkedUser = null;

    await ctx.reply(
      [
        "✅ Telegram desvinculado.",
        "",
        "Para volver a usar el bot: /login",
        "Ayuda: /start",
      ].join("\n"),
    );
  } catch (error) {
    console.error("handleUnlink failed:", error);
    await ctx.reply("No se pudo desvincular. Inténtalo de nuevo.");
  }
}

async function handleCancel(ctx: BotContextWithState) {
  if (ctx.scene.current) {
    (ctx.session as SessionData).movementDraft = undefined;
    await ctx.scene.leave();
    await ctx.reply("Flujo cancelado. Usa /add para empezar de nuevo.");
    return;
  }

  await ctx.reply("No hay ningún flujo activo. Usa /start para ver los comandos.");
}

export function createBot() {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to create the bot");
  }

  const bot = new Telegraf<BotContext>(token);
  const stage = new Scenes.Stage<BotContext>([addMovementScene]);

  bot.use(session());
  bot.use(loadLinkedUser);
  bot.use(stage.middleware());

  bot.start(handleStart);
  bot.help(handleStart);
  bot.command("login", handleLogin);
  bot.command("link", handleLink);
  bot.command("unlink", handleUnlink);
  bot.command("add", requireLinked(), (ctx) => ctx.scene.enter("add-movement"));
  bot.command("last", requireLinked(), handleLast);
  bot.command("month", requireLinked(), handleMonth);
  bot.command("dashboard", requireLinked(), handleDashboard);
  bot.command("cancel", handleCancel);

  bot.catch((error) => {
    console.error("Telegram bot error:", error);
  });

  return bot;
}

export function registerBotWebhook(app: Hono, bot: Telegraf<BotContext>) {
  app.post("/telegram/webhook", async (c) => {
    try {
      if (env.TELEGRAM_WEBHOOK_SECRET) {
        const secret = c.req.header("x-telegram-bot-api-secret-token");
        if (secret !== env.TELEGRAM_WEBHOOK_SECRET) {
          console.warn("Telegram webhook rejected: invalid secret token");
          return c.json({ error: "Unauthorized" }, 401);
        }
      }

      const update = await c.req.json();
      await bot.handleUpdate(update);
      return c.body(null, 200);
    } catch (error) {
      console.error("Telegram webhook handler failed:", error);
      // Respond 200 so Telegram does not retry the same failing update forever.
      return c.body(null, 200);
    }
  });
}

export async function launchBot(bot: Telegraf<BotContext>) {
  if (isProduction) {
    const baseUrl = getPublicApiUrl();
    const webhookUrl = `${baseUrl}/telegram/webhook`;
    await bot.telegram.setWebhook(webhookUrl, {
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    });

    const webhookInfo = await bot.telegram.getWebhookInfo();
    console.log(`Telegram bot started (webhook → ${webhookUrl})`);
    if (webhookInfo.url && webhookInfo.url !== webhookUrl) {
      console.warn(
        `Telegram webhook mismatch: registered as ${webhookInfo.url}, expected ${webhookUrl}`,
      );
    }
    if (webhookInfo.last_error_message) {
      console.warn(
        `Telegram webhook last error: ${webhookInfo.last_error_message}`,
      );
    }

    return bot;
  }

  try {
    await bot.launch();
    console.log("Telegram bot started (polling)");
  } catch (error) {
    console.error("Telegram bot failed to start:", error);
    console.error(
      "Tip: only one instance can poll at a time. Stop other bun run dev:api processes.",
    );
  }

  return bot;
}

export function createBotOrNull() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
    return null;
  }

  return createBot();
}
