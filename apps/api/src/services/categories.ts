import type { SupabaseClient } from "@supabase/supabase-js";
import * as categoriesRepository from "../repositories/categories.js";
import type { Category } from "../types/index.js";

export async function listCategories(
  supabase: SupabaseClient,
): Promise<Category[]> {
  return categoriesRepository.findAllCategories(supabase);
}
