import type { SupabaseClient } from "@supabase/supabase-js";
import { generateSixDigitCode } from "../lib/codes.js";
import * as linkCodesRepository from "../repositories/link-codes.js";
import * as linkSessionsRepository from "../repositories/link-sessions.js";
import * as telegramRepository from "../repositories/telegram.js";
import type { LinkedTelegramUser } from "../repositories/telegram.js";

const CODE_TTL_MS = 10 * 60 * 1000;

export async function createLinkCodeForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ code: string; expiresAt: string }> {
  const code = generateSixDigitCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  const row = await linkCodesRepository.createLinkCode(
    supabase,
    userId,
    code,
    expiresAt,
  );
  return { code: row.code, expiresAt: row.expires_at };
}

async function linkFromSessionCode(
  supabase: SupabaseClient,
  input: {
    code: string;
    telegramId: number;
    telegramUsername?: string;
  },
): Promise<LinkedTelegramUser | null> {
  const session = await linkSessionsRepository.findLinkSessionByCode(
    supabase,
    input.code,
  );

  if (!session?.user_id) {
    return null;
  }

  if (session.telegram_id !== input.telegramId) {
    throw new Error("TELEGRAM_MISMATCH");
  }

  const existingTelegram = await telegramRepository.findByTelegramId(
    supabase,
    input.telegramId,
  );
  if (existingTelegram) {
    throw new Error("TELEGRAM_ALREADY_LINKED");
  }

  const linked = await telegramRepository.linkTelegramAccount(supabase, {
    userId: session.user_id,
    telegramId: input.telegramId,
    telegramUsername: input.telegramUsername,
  });

  await linkSessionsRepository.markLinkSessionUsed(supabase, session.id);
  return linked;
}

export async function linkTelegramWithCode(
  supabase: SupabaseClient,
  input: {
    code: string;
    telegramId: number;
    telegramUsername?: string;
  },
): Promise<LinkedTelegramUser> {
  const fromSession = await linkFromSessionCode(supabase, input);
  if (fromSession) {
    return fromSession;
  }

  const linkCode = await linkCodesRepository.findValidLinkCode(
    supabase,
    input.code,
  );

  if (!linkCode) {
    throw new Error("INVALID_OR_EXPIRED_CODE");
  }

  const existingTelegram = await telegramRepository.findByTelegramId(
    supabase,
    input.telegramId,
  );
  if (existingTelegram) {
    throw new Error("TELEGRAM_ALREADY_LINKED");
  }

  const linked = await telegramRepository.linkTelegramAccount(supabase, {
    userId: linkCode.user_id,
    telegramId: input.telegramId,
    telegramUsername: input.telegramUsername,
  });

  await linkCodesRepository.markLinkCodeUsed(supabase, linkCode.id);
  return linked;
}

export async function getLinkedUser(
  supabase: SupabaseClient,
  telegramId: number,
): Promise<LinkedTelegramUser | null> {
  return telegramRepository.findByTelegramId(supabase, telegramId);
}

export async function unlinkTelegram(
  supabase: SupabaseClient,
  telegramId: number,
): Promise<void> {
  const deleted = await telegramRepository.deleteByTelegramId(
    supabase,
    telegramId,
  );

  if (!deleted) {
    throw new Error("NOT_LINKED");
  }
}
