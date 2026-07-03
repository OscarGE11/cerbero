import type { PaginatedResult } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { type MovementRow, toMovement } from "../lib/mappers.js";
import type {
  CreateMovementDto,
  Movement,
  MovementFilters,
} from "../types/index.js";

const MOVEMENT_SELECT =
  "id, user_id, type, title, amount, category_id, custom_category, comment, date, created_at";

// Supabase filter builder types are hard to thread through helpers; keep loose here.
// biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
function applyMovementFilters(query: any, filters: MovementFilters): any {
  let q = query;

  if (filters.type) {
    q = q.eq("type", filters.type);
  }
  if (filters.categoryId) {
    q = q.eq("category_id", filters.categoryId);
  }
  if (filters.from) {
    q = q.gte("date", filters.from);
  }
  if (filters.to) {
    q = q.lte("date", filters.to);
  }
  if (filters.title) {
    q = q.ilike("title", `%${filters.title}%`);
  }
  if (filters.comment) {
    q = q.ilike("comment", `%${filters.comment}%`);
  }
  if (filters.minAmount !== undefined) {
    q = q.gte("amount", filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    q = q.lte("amount", filters.maxAmount);
  }

  const hasCategoryIds =
    filters.categoryIds !== undefined && filters.categoryIds.length > 0;
  const hasCustomFilter =
    Boolean(filters.includeCustom) || Boolean(filters.customCategory);

  if (hasCategoryIds && hasCustomFilter) {
    const categoryIds = filters.categoryIds ?? [];
    const parts: string[] = [`category_id.in.(${categoryIds.join(",")})`];
    if (filters.customCategory) {
      parts.push(`custom_category.ilike.%${filters.customCategory}%`);
    } else {
      parts.push("custom_category.not.is.null");
    }
    q = q.or(parts.join(","));
  } else if (hasCategoryIds) {
    q = q.in("category_id", filters.categoryIds ?? []);
  } else if (hasCustomFilter) {
    if (filters.customCategory) {
      q = q.ilike("custom_category", `%${filters.customCategory}%`);
    } else {
      q = q.not("custom_category", "is", null);
    }
  }

  return q;
}

// biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
function applyMovementSort(query: any, filters: MovementFilters): any {
  const ascending = filters.sortOrder === "asc";

  switch (filters.sortBy) {
    case "amount":
      return query.order("amount", { ascending });
    case "title":
      return query.order("title", { ascending });
    case "comment":
      return query.order("comment", { ascending, nullsFirst: false });
    case "createdAt":
      return query.order("created_at", { ascending });
    case "date":
      return query.order("date", { ascending });
    case "category":
      return query
        .order("category_id", { ascending, nullsFirst: false })
        .order("custom_category", { ascending, nullsFirst: false });
    default:
      return query
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
  }
}

export async function findMovements(
  supabase: SupabaseClient,
  userId: string,
  filters: MovementFilters,
): Promise<Movement[]> {
  let query = supabase
    .from("movements")
    .select(MOVEMENT_SELECT)
    .eq("user_id", userId);

  query = applyMovementFilters(query, filters);
  query = applyMovementSort(query, filters);
  query = query.limit(filters.limit ?? 50);

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
    .select(MOVEMENT_SELECT, { count: "exact" })
    .eq("user_id", userId);

  query = applyMovementFilters(query, filters);
  query = applyMovementSort(query, filters);

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
    .select(MOVEMENT_SELECT)
    .single();

  if (error) throw error;

  return toMovement(data as MovementRow);
}
