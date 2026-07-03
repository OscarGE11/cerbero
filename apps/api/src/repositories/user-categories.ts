import type { MovementType, UserCategory } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type UserCategoryRow, toUserCategory } from "../lib/mappers.js";

const DEFAULT_LIMIT = 8;

export async function findUserCategories(
  supabase: SupabaseClient,
  userId: string,
  type: MovementType,
  limit = DEFAULT_LIMIT,
): Promise<UserCategory[]> {
  const { data, error } = await supabase
    .from("user_categories")
    .select("id, user_id, name, type, use_count, last_used_at, created_at")
    .eq("user_id", userId)
    .eq("type", type)
    .order("last_used_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as UserCategoryRow[]).map(toUserCategory);
}

export async function findUserCategoryById(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<UserCategory | null> {
  const { data, error } = await supabase
    .from("user_categories")
    .select("id, user_id, name, type, use_count, last_used_at, created_at")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return toUserCategory(data as UserCategoryRow);
}

export async function upsertUserCategoryUsage(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  type: MovementType,
): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;

  const { data: existing, error: selectError } = await supabase
    .from("user_categories")
    .select("id, use_count")
    .eq("user_id", userId)
    .eq("name", trimmed)
    .eq("type", type)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { error: updateError } = await supabase
      .from("user_categories")
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase.from("user_categories").insert({
    user_id: userId,
    name: trimmed,
    type,
  });

  if (insertError) throw insertError;
}
