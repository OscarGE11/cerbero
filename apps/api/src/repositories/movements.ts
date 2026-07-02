import type { PaginatedResult } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type MovementRow, toMovement } from "../lib/mappers.js";
import type {
  CreateMovementDto,
  Movement,
  MovementFilters,
} from "../types/index.js";

export async function findMovements(
  supabase: SupabaseClient,
  userId: string,
  filters: MovementFilters,
): Promise<Movement[]> {
  let query = supabase
    .from("movements")
    .select(
      "id, user_id, type, title, amount, category_id, custom_category, comment, date, created_at",
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 50);

  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.from) {
    query = query.gte("date", filters.from);
  }
  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data as MovementRow[]).map(toMovement);
}

export async function findMovementsPaginated(
  supabase: SupabaseClient,
  userId: string,
  filters: MovementFilters,
): Promise<PaginatedResult<Movement>> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  const rangeFrom = (page - 1) * pageSize;
  const rangeTo = rangeFrom + pageSize - 1;

  let query = supabase
    .from("movements")
    .select(
      "id, user_id, type, title, amount, category_id, custom_category, comment, date, created_at",
      { count: "exact" },
    )
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.type) {
    query = query.eq("type", filters.type);
  }
  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }
  if (filters.from) {
    query = query.gte("date", filters.from);
  }
  if (filters.to) {
    query = query.lte("date", filters.to);
  }

  const { data, error, count } = await query.range(rangeFrom, rangeTo);

  if (error) throw error;

  const total = count ?? 0;

  return {
    items: (data as MovementRow[]).map(toMovement),
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function insertMovement(
  supabase: SupabaseClient,
  userId: string,
  dto: CreateMovementDto,
): Promise<Movement> {
  const { data, error } = await supabase
    .from("movements")
    .insert({
      user_id: userId,
      type: dto.type,
      title: dto.title,
      amount: dto.amount,
      category_id: dto.categoryId ?? null,
      custom_category: dto.customCategory ?? null,
      comment: dto.comment ?? null,
      date: dto.date ?? new Date().toISOString().slice(0, 10),
    })
    .select(
      "id, user_id, type, title, amount, category_id, custom_category, comment, date, created_at",
    )
    .single();

  if (error) throw error;

  return toMovement(data as MovementRow);
}
