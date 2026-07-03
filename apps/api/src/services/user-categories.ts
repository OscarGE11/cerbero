import type { MovementType } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import * as userCategoriesRepository from "../repositories/user-categories.js";
import type { UserCategory } from "../types/index.js";

export async function listUserCategories(
  supabase: SupabaseClient,
  userId: string,
  type: MovementType,
  limit?: number,
): Promise<UserCategory[]> {
  return userCategoriesRepository.findUserCategories(
    supabase,
    userId,
    type,
    limit,
  );
}

export async function getUserCategory(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<UserCategory | null> {
  return userCategoriesRepository.findUserCategoryById(supabase, userId, id);
}

export async function recordUserCategoryUsage(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  type: MovementType,
): Promise<void> {
  return userCategoriesRepository.upsertUserCategoryUsage(
    supabase,
    userId,
    name,
    type,
  );
}
