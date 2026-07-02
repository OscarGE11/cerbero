import type { SupabaseClient } from "@supabase/supabase-js";
import { type CategoryRow, toCategory } from "../lib/mappers.js";
import type { Category } from "../types/index.js";

export async function findAllCategories(
  supabase: SupabaseClient,
): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, icon")
    .order("name");

  if (error) throw error;

  return (data as CategoryRow[]).map(toCategory);
}
