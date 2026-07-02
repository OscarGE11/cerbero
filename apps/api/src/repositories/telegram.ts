import type { SupabaseClient } from "@supabase/supabase-js";

export interface TelegramAccountRow {
  id: string;
  user_id: string;
  telegram_id: number;
  telegram_username: string | null;
  linked_at: string;
}

export interface LinkedTelegramUser {
  userId: string;
  telegramId: number;
  telegramUsername?: string;
}

export async function findByTelegramId(
  supabase: SupabaseClient,
  telegramId: number,
): Promise<LinkedTelegramUser | null> {
  const { data, error } = await supabase
    .from("telegram_accounts")
    .select("user_id, telegram_id, telegram_username")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    userId: data.user_id,
    telegramId: data.telegram_id,
    ...(data.telegram_username
      ? { telegramUsername: data.telegram_username }
      : {}),
  };
}

export async function linkTelegramAccount(
  supabase: SupabaseClient,
  input: {
    userId: string;
    telegramId: number;
    telegramUsername?: string;
  },
): Promise<LinkedTelegramUser> {
  const { data, error } = await supabase
    .from("telegram_accounts")
    .insert({
      user_id: input.userId,
      telegram_id: input.telegramId,
      telegram_username: input.telegramUsername ?? null,
    })
    .select("user_id, telegram_id, telegram_username")
    .single();

  if (error) throw error;

  return {
    userId: data.user_id,
    telegramId: data.telegram_id,
    ...(data.telegram_username
      ? { telegramUsername: data.telegram_username }
      : {}),
  };
}
