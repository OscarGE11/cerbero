import type { Context, Next } from "hono";
import {
  TelegramInitDataError,
  type TelegramWebAppUser,
  validateTelegramInitData,
} from "../lib/telegram-init-data.js";
import type { TelegramAppVariables } from "../types/index.js";

type InitDataContext = Context<{ Variables: TelegramAppVariables }>;

export function getInitDataFromRequest(c: InitDataContext): string | null {
  return c.req.header("X-Telegram-Init-Data")?.trim() || null;
}

export async function requireInitDataMiddleware(
  c: InitDataContext,
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
    await next();
  } catch (error) {
    if (error instanceof TelegramInitDataError) {
      const status = error.code === "INIT_DATA_EXPIRED" ? 401 : 401;
      return c.json({ error: error.code }, status);
    }
    console.error("requireInitDataMiddleware failed:", error);
    return c.json({ error: "INVALID_INIT_DATA" }, 401);
  }
}

export function getTelegramUser(
  c: InitDataContext,
): TelegramWebAppUser | undefined {
  return c.get("telegramUser");
}
