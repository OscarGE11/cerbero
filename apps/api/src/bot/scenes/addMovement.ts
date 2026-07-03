import { Markup, Scenes } from "telegraf";
import { createAdminSupabase } from "../../config/supabase.js";
import { formatCurrency } from "../../lib/format.js";
import * as categoriesService from "../../services/categories.js";
import * as movementsService from "../../services/movements.js";
import * as userCategoriesService from "../../services/user-categories.js";
import type { Category } from "../../types/index.js";
import {
  buildMovementSummary,
  parsePositiveAmount,
} from "../lib/movement-draft.js";
import type { BotContext, MovementDraft, SessionData } from "../types.js";

const SAVED_CATEGORIES_LIMIT = 8;

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

async function showCategoryStep(
  ctx: BotContext,
  movementType: NonNullable<MovementDraft["type"]>,
) {
  const supabase = createAdminSupabase();
  const categories = await categoriesService.listCategories(
    supabase,
    movementType,
  );

  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < categories.length; i += 2) {
    const row = categories
      .slice(i, i + 2)
      .map((cat: Category) =>
        Markup.button.callback(cat.name, `add:cat:${cat.id}:${cat.name}`),
      );
    rows.push(row);
  }

  await ctx.reply(
    movementType === "income"
      ? "¿Categoría de ingreso?"
      : "¿Categoría de gasto?",
    Markup.inlineKeyboard(rows),
  );
}

async function promptCustomCategoryText(ctx: BotContext) {
  await ctx.reply("Escribe la categoría personalizada:");
  return ctx.wizard.selectStep(3);
}

async function showSavedCategoryPicker(ctx: BotContext) {
  const draft = getDraft(ctx);
  const linkedUser = ctx.state.linkedUser;

  if (!draft.type || !linkedUser) {
    return promptCustomCategoryText(ctx);
  }

  const supabase = createAdminSupabase();
  const saved = await userCategoriesService.listUserCategories(
    supabase,
    linkedUser.userId,
    draft.type,
    SAVED_CATEGORIES_LIMIT,
  );

  if (saved.length === 0) {
    return promptCustomCategoryText(ctx);
  }

  const rows: ReturnType<typeof Markup.button.callback>[][] = [];
  for (let i = 0; i < saved.length; i += 2) {
    rows.push(
      saved
        .slice(i, i + 2)
        .map((cat) => Markup.button.callback(cat.name, `add:saved:${cat.id}`)),
    );
  }
  rows.push([Markup.button.callback("✏️ Escribir nueva", "add:custom:new")]);

  await ctx.reply(
    "Elige una categoría guardada o escribe una nueva:",
    Markup.inlineKeyboard(rows),
  );
  return ctx.wizard.selectStep(3);
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
    const name = message.text.trim();
    if (!name) {
      await ctx.reply("La categoría no puede estar vacía. Inténtalo de nuevo:");
      return;
    }
    const draft = getDraft(ctx);
    draft.customCategory = name;
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
    const amount = parsePositiveAmount(message.text);
    if (amount === null) {
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
      buildMovementSummary(draft),
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
  await showCategoryStep(ctx, draft.type);
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
    return showSavedCategoryPicker(ctx);
  }

  await ctx.reply("Título del movimiento:");
  return ctx.wizard.selectStep(4);
});

addMovementScene.action(/^add:saved:([0-9a-f-]{36})$/i, async (ctx) => {
  const linkedUser = ctx.state.linkedUser;
  if (!linkedUser) {
    await ctx.answerCbQuery("Cuenta no vinculada");
    return;
  }

  const categoryId = ctx.match[1];
  const supabase = createAdminSupabase();
  const saved = await userCategoriesService.getUserCategory(
    supabase,
    linkedUser.userId,
    categoryId,
  );

  await ctx.answerCbQuery();

  if (!saved) {
    await ctx.reply(
      "Esa categoría ya no existe. Elige otra o escribe una nueva.",
    );
    return showSavedCategoryPicker(ctx);
  }

  const draft = getDraft(ctx);
  draft.customCategory = saved.name;
  draft.categoryName = saved.name;
  await ctx.reply("Título del movimiento:");
  return ctx.wizard.selectStep(4);
});

addMovementScene.action("add:custom:new", async (ctx) => {
  await ctx.answerCbQuery();
  return promptCustomCategoryText(ctx);
});

addMovementScene.action("add:comment:skip", async (ctx) => {
  await ctx.answerCbQuery();
  const draft = getDraft(ctx);
  await ctx.reply(
    buildMovementSummary(draft),
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
      buildMovementSummary(draft),
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
    await ctx.reply("Tu cuenta no está vinculada. Usa /login para empezar.");
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
      `✅ ${typeLabel} guardado: ${movement.title} (${formatCurrency(movement.amount)})`,
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
