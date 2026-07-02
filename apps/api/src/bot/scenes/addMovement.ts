import { Markup, Scenes } from "telegraf";
import { createAdminSupabase } from "../../config/supabase.js";
import * as categoriesService from "../../services/categories.js";
import * as movementsService from "../../services/movements.js";
import type { Category } from "../../types/index.js";
import type { BotContext, MovementDraft, SessionData } from "../types.js";

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

function getDraft(ctx: BotContext): MovementDraft {
  const session = ctx.session as SessionData;
  session.movementDraft ??= {};
  return session.movementDraft;
}

async function showTypeStep(ctx: BotContext) {
  await ctx.reply(
    "¿Gasto o ingreso?",
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Gasto", "add:type:expense"),
        Markup.button.callback("Ingreso", "add:type:income"),
      ],
    ]),
  );
}

async function showCategoryStep(ctx: BotContext) {
  const supabase = createAdminSupabase();
  const categories = await categoriesService.listCategories(supabase);

  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = categories
      .slice(i, i + 2)
      .map((cat: Category) =>
        Markup.button.callback(cat.name, `add:cat:${cat.id}:${cat.name}`),
      );
    rows.push(row);
  }

  await ctx.reply("¿Categoría?", Markup.inlineKeyboard(rows));
}

function buildSummary(draft: MovementDraft): string {
  const typeLabel = draft.type === "income" ? "Ingreso" : "Gasto";
  const category =
    draft.customCategory ?? draft.categoryName ?? "Sin categoría";
  return [
    "Confirma el movimiento:",
    `• Tipo: ${typeLabel}`,
    `• Categoría: ${category}`,
    `• Título: ${draft.title}`,
    `• Importe: ${formatAmount(draft.amount ?? 0)}`,
    `• Comentario: ${draft.comment ?? "—"}`,
  ].join("\n");
}

export const addMovementScene = new Scenes.WizardScene<BotContext>(
  "add-movement",
  async (ctx) => {
    const session = ctx.session as SessionData;
    session.movementDraft = {};
    await showTypeStep(ctx);
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply("Selecciona el tipo con los botones de arriba.");
  },
  async (ctx) => {
    await ctx.reply("Selecciona una categoría con los botones.");
  },
  async (ctx) => {
    const message = ctx.message;
    if (!message || !("text" in message)) {
      await ctx.reply("Escribe el nombre de la categoría personalizada:");
      return;
    }
    const draft = getDraft(ctx);
    draft.customCategory = message.text.trim();
    await ctx.reply("Título del movimiento:");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message;
    if (!message || !("text" in message)) {
      await ctx.reply("Escribe el título del movimiento:");
      return;
    }
    getDraft(ctx).title = message.text.trim();
    await ctx.reply("Importe (número, ej: 25.50):");
    return ctx.wizard.next();
  },
  async (ctx) => {
    const message = ctx.message;
    if (!message || !("text" in message)) {
      await ctx.reply("Escribe el importe:");
      return;
    }
    const amount = Number.parseFloat(message.text.replace(",", "."));
    if (Number.isNaN(amount) || amount <= 0) {
      await ctx.reply("Importe no válido. Escribe un número mayor que 0:");
      return;
    }
    getDraft(ctx).amount = amount;
    await ctx.reply(
      "Comentario (opcional):",
      Markup.inlineKeyboard([
        Markup.button.callback("Saltar", "add:comment:skip"),
      ]),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply('Escribe un comentario o pulsa "Saltar".');
  },
  async (ctx) => {
    const draft = getDraft(ctx);
    await ctx.reply(
      buildSummary(draft),
      Markup.inlineKeyboard([
        [
          Markup.button.callback("Confirmar", "add:confirm:yes"),
          Markup.button.callback("Cancelar", "add:confirm:no"),
        ],
      ]),
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    await ctx.reply("Pulsa Confirmar o Cancelar.");
  },
);

addMovementScene.action(/^add:type:(expense|income)$/, async (ctx) => {
  const draft = getDraft(ctx);
  draft.type = ctx.match[1] as MovementDraft["type"];
  await ctx.answerCbQuery();
  await showCategoryStep(ctx);
  return ctx.wizard.selectStep(2);
});

addMovementScene.action(/^add:cat:([^:]+):(.+)$/, async (ctx) => {
  const draft = getDraft(ctx);
  const categoryId = ctx.match[1];
  const categoryName = ctx.match[2];
  draft.categoryId = categoryId;
  draft.categoryName = categoryName;

  await ctx.answerCbQuery();

  if (categoryName === "Otro") {
    draft.categoryId = undefined;
    await ctx.reply("Escribe la categoría personalizada:");
    return ctx.wizard.selectStep(3);
  }

  await ctx.reply("Título del movimiento:");
  return ctx.wizard.selectStep(4);
});

addMovementScene.action("add:comment:skip", async (ctx) => {
  await ctx.answerCbQuery();
  const draft = getDraft(ctx);
  await ctx.reply(
    buildSummary(draft),
    Markup.inlineKeyboard([
      [
        Markup.button.callback("Confirmar", "add:confirm:yes"),
        Markup.button.callback("Cancelar", "add:confirm:no"),
      ],
    ]),
  );
  return ctx.wizard.selectStep(7);
});

addMovementScene.on("text", async (ctx, next) => {
  const step = ctx.wizard.cursor;
  const message = ctx.message;

  if (step === 6 && message && "text" in message) {
    getDraft(ctx).comment = message.text.trim();
    const draft = getDraft(ctx);
    await ctx.reply(
      buildSummary(draft),
      Markup.inlineKeyboard([
        [
          Markup.button.callback("Confirmar", "add:confirm:yes"),
          Markup.button.callback("Cancelar", "add:confirm:no"),
        ],
      ]),
    );
    return ctx.wizard.selectStep(7);
  }

  return next();
});

addMovementScene.action("add:confirm:yes", async (ctx) => {
  await ctx.answerCbQuery();
  const linkedUser = ctx.state.linkedUser;
  if (!linkedUser) {
    await ctx.reply("Tu cuenta no está vinculada. Usa /link primero.");
    return ctx.scene.leave();
  }

  const draft = getDraft(ctx);
  if (!draft.type || !draft.title || draft.amount === undefined) {
    await ctx.reply("Faltan datos del movimiento. Empieza de nuevo con /add.");
    (ctx.session as SessionData).movementDraft = undefined;
    return ctx.scene.leave();
  }

  try {
    const supabase = createAdminSupabase();
    const movement = await movementsService.createMovement(
      supabase,
      linkedUser.userId,
      {
        type: draft.type,
        title: draft.title,
        amount: draft.amount,
        ...(draft.categoryId ? { categoryId: draft.categoryId } : {}),
        ...(draft.customCategory
          ? { customCategory: draft.customCategory }
          : {}),
        ...(draft.comment ? { comment: draft.comment } : {}),
      },
    );

    const typeLabel = movement.type === "income" ? "Ingreso" : "Gasto";
    await ctx.reply(
      `✅ ${typeLabel} guardado: ${movement.title} (${formatAmount(movement.amount)})`,
    );
  } catch (error) {
    console.error("Bot create movement failed:", error);
    await ctx.reply("No se pudo guardar el movimiento. Inténtalo de nuevo.");
  }

  (ctx.session as SessionData).movementDraft = undefined;
  return ctx.scene.leave();
});

addMovementScene.action("add:confirm:no", async (ctx) => {
  await ctx.answerCbQuery();
  (ctx.session as SessionData).movementDraft = undefined;
  await ctx.reply("Movimiento cancelado.");
  return ctx.scene.leave();
});

addMovementScene.command("cancel", async (ctx) => {
  (ctx.session as SessionData).movementDraft = undefined;
  await ctx.reply("Flujo cancelado.");
  return ctx.scene.leave();
});
