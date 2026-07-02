import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env.js";
import * as linkSessionsRepository from "../repositories/link-sessions.js";

export function getLinkPageUrl(): string {
  return (
    process.env.DASHBOARD_URL ??
    process.env.NEXT_PUBLIC_DASHBOARD_URL ??
    env.DASHBOARD_URL
  );
}

export async function startLoginSession(
  supabase: SupabaseClient,
  input: { telegramId: number; telegramUsername?: string },
): Promise<{ url: string; token: string }> {
  const session = await linkSessionsRepository.createLinkSession(
    supabase,
    input,
  );
  const url = `${getLinkPageUrl()}/link?token=${session.token}`;
  return { url, token: session.token };
}

export async function completeLoginSession(
  supabase: SupabaseClient,
  input: { token: string; userId: string },
): Promise<{ code: string; expiresAt: string }> {
  const session = await linkSessionsRepository.findLinkSessionByToken(
    supabase,
    input.token,
  );

  if (!session) {
    throw new Error("INVALID_OR_EXPIRED_SESSION");
  }

  if (session.completed_at) {
    throw new Error("SESSION_ALREADY_COMPLETED");
  }

  const code = linkSessionsRepository.generateSixDigitCode();
  await linkSessionsRepository.completeLinkSession(supabase, {
    sessionId: session.id,
    userId: input.userId,
    code,
  });

  return { code, expiresAt: session.expires_at };
}

export async function getLinkSessionByToken(
  supabase: SupabaseClient,
  token: string,
) {
  return linkSessionsRepository.findLinkSessionByToken(supabase, token);
}
