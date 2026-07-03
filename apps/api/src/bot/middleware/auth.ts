import type { MiddlewareFn } from "telegraf";
import { createAdminSupabase } from "../../config/supabase.js";
import * as telegramService from "../../services/telegram.js";
import type { BotContextWithState } from "../types.js";

export const loadLinkedUser: MiddlewareFn<BotContextWithState> = async (
  ctx,
  next,
) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await next();
    return;
  }

  try {
    const supabase = createAdminSupabase();
    ctx.state.linkedUser = await telegramService.getLinkedUser(
      supabase,
      telegramId,
    );
  } catch (error) {
    console.error("loadLinkedUser failed:", error);
    ctx.state.linkedUser = null;
  }

  await next();
};

export function requireLinked(): MiddlewareFn<BotContextWithState> {
  return async (ctx, next) => {
    if (!ctx.state.linkedUser) {
      await ctx.reply(
        "Primero vincula tu cuenta.\n\nUsa /login — te mandará un enlace al dashboard para registrarte y obtener el código OTP.",
      );
      return;
    }
    await next();
  };
}
