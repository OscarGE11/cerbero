import type { Hono } from "hono";
import { Markup, Telegraf } from "telegraf";
import { env, isProduction } from "../config/env.js";
import { getPublicApiUrl } from "../config/public-url.js";
import { createAdminSupabase } from "../config/supabase.js";
import * as movementsService from "../services/movements.js";
import * as telegramService from "../services/telegram.js";
import {
  formatAlreadyLinkedMessage,
  formatLinkSuccessMessage,
  formatStartMessage,
  getDashboardUrl,
  getTelegramWebAppUrl,
} from "./lib/messages.js";
import { loadLinkedUser, requireLinked } from "./middleware/auth.js";
import type { BotContext, BotContextWithState } from "./types.js";

import { formatCurrency } from "../lib/format.js";
import { RateLimiter } from "../lib/rate-limit.js";
import { safeEqual } from "../lib/safe-equal.js";

// Anti-brute-force: cap /link CODE attempts per Telegram account.
const linkAttemptLimiter = new RateLimiter(5, 10 * 60 * 1000);

async function handleStart(ctx: BotContextWithState) {
  const linked = Boolean(ctx.state.linkedUser);
  const keyboard = linked
    ? Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            "Añadir movimiento",
            getTelegramWebAppUrl("/add"),
          ),
        ],
        [Markup.button.webApp("Abrir Cerbero", getTelegramWebAppUrl())],
      ])
    : Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            "Vincular cuenta",
            getTelegramWebAppUrl("/link"),
          ),
        ],
      ]);

  await ctx.reply(formatStartMessage(linked), keyboard);
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

  await ctx.reply(
    "Pulsa el botón para abrir Cerbero y vincular tu cuenta:",
    Markup.inlineKeyboard([
      [Markup.button.webApp("Vincular cuenta", getTelegramWebAppUrl("/link"))],
    ]),
  );
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
        "• Web App (recomendado): /login",
        "• Código OTP del dashboard: /link TU_CODIGO",
      ].join("\n"),
      Markup.inlineKeyboard([
        [
          Markup.button.webApp(
            "Vincular cuenta",
            getTelegramWebAppUrl("/link"),
          ),
        ],
      ]),
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

  if (!linkAttemptLimiter.check(String(telegramId)).allowed) {
    await ctx.reply(
      "Demasiados intentos de vinculación. Espera unos minutos e inténtalo de nuevo.",
    );
    return;
  }

  try {
    const supabase = createAdminSupabase();
    await telegramService.linkTelegramWithCode(supabase, {
      code,
      telegramId,
      telegramUsername: ctx.from?.username,
    });
    linkAttemptLimiter.reset(String(telegramId));
    ctx.state.linkedUser = await telegramService.getLinkedUser(
      supabase,
      telegramId,
    );
    await ctx.reply(formatLinkSuccessMessage());
  } catch (error) {
    const messageText =
      error instanceof Error && error.message === "INVALID_OR_EXPIRED_CODE"
        ? "Código inválido o expirado. Usa /login para la Web App."
        : error instanceof Error && error.message === "TELEGRAM_MISMATCH"
          ? "Este código pertenece a otra cuenta de Telegram. Usa /login desde tu Telegram."
          : error instanceof Error &&
              error.message === "TELEGRAM_ALREADY_LINKED"
            ? "Este Telegram ya está vinculado a otra cuenta."
            : "No se pudo vincular la cuenta. Inténtalo de nuevo.";

    await ctx.reply(messageText);
  }
}

async function handleAdd(ctx: BotContextWithState) {
  await ctx.reply(
    "Abre el formulario para añadir un movimiento:",
    Markup.inlineKeyboard([
      [Markup.button.webApp("Añadir movimiento", getTelegramWebAppUrl("/add"))],
    ]),
  );
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

export function createBot() {
  const token = env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is required to create the bot");
  }

  const bot = new Telegraf<BotContext>(token);

  bot.use(loadLinkedUser);

  bot.start(handleStart);
  bot.help(handleStart);
  bot.command("login", handleLogin);
  bot.command("link", handleLink);
  bot.command("unlink", handleUnlink);
  bot.command("add", requireLinked(), handleAdd);
  bot.command("last", requireLinked(), handleLast);
  bot.command("month", requireLinked(), handleMonth);
  bot.command("dashboard", requireLinked(), handleDashboard);

  bot.catch((error) => {
    console.error("Telegram bot error:", error);
  });

  return bot;
}

export function registerBotWebhook(app: Hono, bot: Telegraf<BotContext>) {
  app.post("/telegram/webhook", async (c) => {
    try {
      if (env.TELEGRAM_WEBHOOK_SECRET) {
        const secret = c.req.header("x-telegram-bot-api-secret-token") ?? "";
        if (!safeEqual(secret, env.TELEGRAM_WEBHOOK_SECRET)) {
          console.warn("Telegram webhook rejected: invalid secret token");
          return c.json({ error: "Unauthorized" }, 401);
        }
      }

      const update = await c.req.json();
      await bot.handleUpdate(update);
      return c.body(null, 200);
    } catch (error) {
      console.error("Telegram webhook handler failed:", error);
      return c.body(null, 200);
    }
  });
}

async function configureMenuButton(bot: Telegraf<BotContext>) {
  try {
    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: "web_app",
        text: "Abrir Cerbero",
        web_app: { url: getTelegramWebAppUrl() },
      },
    });
  } catch (error) {
    console.warn("setChatMenuButton failed:", error);
  }
}

export async function launchBot(bot: Telegraf<BotContext>) {
  await configureMenuButton(bot);

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
