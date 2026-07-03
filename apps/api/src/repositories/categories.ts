import type { MovementType } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type CategoryRow, toCategory } from "../lib/mappers.js";
import type { Category } from "../types/index.js";

export async function findAllCategories(
  supabase: SupabaseClient,
  type?: MovementType,
): Promise<Category[]> {
  let query = supabase
    .from("categories")
    .select("id, name, type, icon")
    .order("name");

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data as CategoryRow[]).map(toCategory);
}
