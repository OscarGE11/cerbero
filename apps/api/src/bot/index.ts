import { Scenes, Telegraf, session } from "telegraf";
import { env } from "../config/env.js";
import { createAdminSupabase } from "../config/supabase.js";
import * as linkSessionsService from "../services/link-sessions.js";
import * as movementsService from "../services/movements.js";
import * as telegramService from "../services/telegram.js";
import { loadLinkedUser, requireLinked } from "./middleware/auth.js";
import { addMovementScene } from "./scenes/addMovement.js";
import type { BotContext, BotContextWithState, SessionData } from "./types.js";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

async function handleStart(ctx: BotContextWithState) {
  if (ctx.state.linkedUser) {
    await ctx.reply(
      "Bienvenido de nuevo a Cerbero.\n\n/add — Añadir movimiento\n/last — Últimos movimientos\n/month — Resumen del mes",
    );
    return;
  }

  await ctx.reply(
    [
      "Bienvenido a Cerbero, tu tracker de gastos e ingresos.",
      "",
      "Para vincular tu cuenta:",
      "/login — Te manda un enlace web para registrarte y obtener el código OTP",
      "",
      "Luego envía al bot: /link TU_CODIGO",
    ].join("\n"),
  );
}

async function handleLogin(ctx: BotContextWithState) {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("No se pudo identificar tu cuenta de Telegram.");
    return;
  }

  if (ctx.state.linkedUser) {
    await ctx.reply(
      [
        "Tu Telegram ya está vinculado.",
        "",
        `Abre el dashboard: ${env.DASHBOARD_URL}/dashboard`,
        "",
        "Usa /add para registrar movimientos desde aquí.",
      ].join("\n"),
    );
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
        "Al terminar verás un código OTP.",
        "Vuelve aquí y envía: /link TU_CODIGO",
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
        "Para vincular tu cuenta usa /login — te dará un enlace web y un código OTP.",
        "",
        "Si ya tienes el código de 6 dígitos:",
        "/link TU_CODIGO",
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
    await ctx.reply("Tu Telegram ya está vinculado.");
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
    await ctx.reply(
      "✅ Cuenta vinculada correctamente. Ya puedes usar /add, /last y /month.",
    );
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
    await ctx.reply("No tienes movimientos todavía. Usa /add para crear uno.");
    return;
  }

  const lines = movements.map((m) => {
    const sign = m.type === "income" ? "+" : "-";
    return `${sign} ${formatAmount(m.amount)} · ${m.title} (${m.date})`;
  });

  await ctx.reply(["Últimos 5 movimientos:", "", ...lines].join("\n"));
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
      `• Gastos: ${formatAmount(summary.expenses)}`,
      `• Ingresos: ${formatAmount(summary.income)}`,
      `• Balance: ${formatAmount(summary.balance)}`,
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
      "✅ Telegram desvinculado. Usa /login para volver a enlazar.",
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
    await ctx.reply("Flujo cancelado.");
    return;
  }

  await ctx.reply("No hay ningún flujo activo.");
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
  bot.command("login", handleLogin);
  bot.command("link", handleLink);
  bot.command("unlink", handleUnlink);
  bot.command("add", requireLinked(), (ctx) => ctx.scene.enter("add-movement"));
  bot.command("last", requireLinked(), handleLast);
  bot.command("month", requireLinked(), handleMonth);
  bot.command("cancel", handleCancel);

  bot.catch((error) => {
    console.error("Telegram bot error:", error);
  });

  return bot;
}

export function launchBot() {
  if (!env.TELEGRAM_BOT_TOKEN) {
    console.warn("TELEGRAM_BOT_TOKEN not set — bot disabled");
    return;
  }

  const bot = createBot();

  void bot
    .launch()
    .then(() => {
      console.log("Telegram bot started (polling)");
    })
    .catch((error) => {
      console.error("Telegram bot failed to start:", error);
      console.error(
        "Tip: only one instance can poll at a time. Stop other bun run dev:api processes.",
      );
    });

  return bot;
}
