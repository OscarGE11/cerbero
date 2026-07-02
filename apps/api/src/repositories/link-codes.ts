import type { SupabaseClient } from "@supabase/supabase-js";

export interface LinkCodeRow {
  id: string;
  user_id: string;
  code: string;
  expires_at: string;
  used_at: string | null;
}

export async function createLinkCode(
  supabase: SupabaseClient,
  userId: string,
  code: string,
  expiresAt: Date,
): Promise<LinkCodeRow> {
  const { data, error } = await supabase
    .from("link_codes")
    .insert({
      user_id: userId,
      code,
      expires_at: expiresAt.toISOString(),
    })
    .select("id, user_id, code, expires_at, used_at")
    .single();

  if (error) throw error;
  return data as LinkCodeRow;
}

export async function findValidLinkCode(
  supabase: SupabaseClient,
  code: string,
): Promise<LinkCodeRow | null> {
  const { data, error } = await supabase
    .from("link_codes")
    .select("id, user_id, code, expires_at, used_at")
    .eq("code", code)
    .is("used_at", null)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as LinkCodeRow | null;
}

export async function markLinkCodeUsed(
  supabase: SupabaseClient,
  codeId: string,
): Promise<void> {
  const { error } = await supabase
    .from("link_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", codeId);

  if (error) throw error;
}
