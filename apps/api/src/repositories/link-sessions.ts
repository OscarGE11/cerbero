import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const SESSION_TTL_MS = 30 * 60 * 1000;

export interface LinkSessionRow {
  id: string;
  token: string;
  telegram_id: number;
  telegram_username: string | null;
  user_id: string | null;
  code: string | null;
  expires_at: string;
  completed_at: string | null;
  used_at: string | null;
}

export async function createLinkSession(
  supabase: SupabaseClient,
  input: { telegramId: number; telegramUsername?: string },
): Promise<LinkSessionRow> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const { data, error } = await supabase
    .from("telegram_link_sessions")
    .insert({
      token,
      telegram_id: input.telegramId,
      telegram_username: input.telegramUsername ?? null,
      expires_at: expiresAt.toISOString(),
    })
    .select(
      "id, token, telegram_id, telegram_username, user_id, code, expires_at, completed_at, used_at",
    )
    .single();

  if (error) throw error;
  return data as LinkSessionRow;
}

export async function findLinkSessionByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<LinkSessionRow | null> {
  const { data, error } = await supabase
    .from("telegram_link_sessions")
    .select(
      "id, token, telegram_id, telegram_username, user_id, code, expires_at, completed_at, used_at",
    )
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as LinkSessionRow | null;
}

export async function completeLinkSession(
  supabase: SupabaseClient,
  input: { sessionId: string; userId: string; code: string },
): Promise<LinkSessionRow> {
  const { data, error } = await supabase
    .from("telegram_link_sessions")
    .update({
      user_id: input.userId,
      code: input.code,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .is("completed_at", null)
    .select(
      "id, token, telegram_id, telegram_username, user_id, code, expires_at, completed_at, used_at",
    )
    .single();

  if (error) throw error;
  return data as LinkSessionRow;
}

export async function findLinkSessionByCode(
  supabase: SupabaseClient,
  code: string,
): Promise<LinkSessionRow | null> {
  const { data, error } = await supabase
    .from("telegram_link_sessions")
    .select(
      "id, token, telegram_id, telegram_username, user_id, code, expires_at, completed_at, used_at",
    )
    .eq("code", code)
    .is("used_at", null)
    .not("completed_at", "is", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as LinkSessionRow | null;
}

export async function markLinkSessionUsed(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<void> {
  const { error } = await supabase
    .from("telegram_link_sessions")
    .update({ used_at: new Date().toISOString() })
    .eq("id", sessionId);

  if (error) throw error;
}
