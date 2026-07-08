import { createHmac } from "node:crypto";
import { env } from "../config/env.js";
import { safeEqual } from "./safe-equal.js";

const INIT_DATA_MAX_AGE_SEC = 24 * 60 * 60;

export interface TelegramWebAppUser {
  telegramId: number;
  telegramUsername?: string;
  firstName?: string;
}

export class TelegramInitDataError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_INIT_DATA"
      | "INIT_DATA_EXPIRED"
      | "MISSING_BOT_TOKEN" = "INVALID_INIT_DATA",
  ) {
    super(message);
    this.name = "TelegramInitDataError";
  }
}

function getSecretKey(botToken: string): Buffer {
  return createHmac("sha256", "WebAppData").update(botToken).digest();
}

export function validateTelegramInitData(
  initData: string,
  botToken?: string,
): TelegramWebAppUser {
  const token = botToken ?? env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new TelegramInitDataError(
      "TELEGRAM_BOT_TOKEN not configured",
      "MISSING_BOT_TOKEN",
    );
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    throw new TelegramInitDataError("Missing hash", "INVALID_INIT_DATA");
  }
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const calculatedHash = createHmac("sha256", getSecretKey(token))
    .update(dataCheckString)
    .digest("hex");

  if (!safeEqual(calculatedHash, hash)) {
    throw new TelegramInitDataError("Invalid hash", "INVALID_INIT_DATA");
  }

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Number.isNaN(authDate)) {
    throw new TelegramInitDataError("Missing auth_date", "INVALID_INIT_DATA");
  }

  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > INIT_DATA_MAX_AGE_SEC) {
    throw new TelegramInitDataError("initData expired", "INIT_DATA_EXPIRED");
  }

  const userJson = params.get("user");
  if (!userJson) {
    throw new TelegramInitDataError("Missing user", "INVALID_INIT_DATA");
  }

  let user: { id: number; username?: string; first_name?: string };
  try {
    user = JSON.parse(userJson) as {
      id: number;
      username?: string;
      first_name?: string;
    };
  } catch {
    throw new TelegramInitDataError("Invalid user JSON", "INVALID_INIT_DATA");
  }

  if (!user.id) {
    throw new TelegramInitDataError("Missing user id", "INVALID_INIT_DATA");
  }

  return {
    telegramId: user.id,
    ...(user.username ? { telegramUsername: user.username } : {}),
    ...(user.first_name ? { firstName: user.first_name } : {}),
  };
}

/** Build signed initData for tests. */
export function signTelegramInitData(
  fields: Record<string, string>,
  botToken: string,
): string {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const hash = createHmac("sha256", getSecretKey(botToken))
    .update(dataCheckString)
    .digest("hex");

  params.set("hash", hash);
  return params.toString();
}
