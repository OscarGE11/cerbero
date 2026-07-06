import type { Context, Next } from "hono";
import { createAdminSupabase } from "../config/supabase.js";
import {
  TelegramInitDataError,
  validateTelegramInitData,
} from "../lib/telegram-init-data.js";
import * as telegramService from "../services/telegram.js";
import type { TelegramAppVariables } from "../types/index.js";
import { getInitDataFromRequest } from "./telegram-init-data.js";

type TelegramAuthContext = Context<{ Variables: TelegramAppVariables }>;

export async function requireLinkedTelegramMiddleware(
  c: TelegramAuthContext,
  next: Next,
) {
  const initData = getInitDataFromRequest(c);
  if (!initData) {
    return c.json({ error: "Missing X-Telegram-Init-Data header" }, 401);
  }

  try {
    const telegramUser = validateTelegramInitData(initData);
    c.set("telegramUser", {
      telegramId: telegramUser.telegramId,
      ...(telegramUser.telegramUsername
        ? { telegramUsername: telegramUser.telegramUsername }
        : {}),
      ...(telegramUser.firstName ? { firstName: telegramUser.firstName } : {}),
    });
    c.set("telegramId", telegramUser.telegramId);

    const supabase = createAdminSupabase();
    const linkedUser = await telegramService.getLinkedUser(
      supabase,
      telegramUser.telegramId,
    );

    if (!linkedUser) {
      return c.json({ error: "NOT_LINKED" }, 401);
    }

    c.set("userId", linkedUser.userId);
    await next();
  } catch (error) {
    if (error instanceof TelegramInitDataError) {
      return c.json({ error: error.code }, 401);
    }
    console.error("requireLinkedTelegramMiddleware failed:", error);
    return c.json({ error: "INVALID_INIT_DATA" }, 401);
  }
}
