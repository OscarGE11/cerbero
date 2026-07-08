import type { MovementFilters } from "../types/index.js";

/**
 * Strip PostgREST reserved characters that would break an `.or()` filter
 * string when interpolating a free-text value (prevents filter injection).
 */
function sanitizeOrFilterValue(value: string): string {
  return value.replace(/[,()"\\]/g, "");
}

type QueryChain = Record<string, (...args: unknown[]) => QueryChain>;

export function applyMovementFilters(
  // biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
  query: any,
  filters: MovementFilters,
  // biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
): any {
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
      const safe = sanitizeOrFilterValue(filters.customCategory);
      parts.push(`custom_category.ilike.%${safe}%`);
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

export function applyMovementSort(
  // biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
  query: any,
  filters: MovementFilters,
  // biome-ignore lint/suspicious/noExplicitAny: Supabase query builder chaining
): any {
  const ascending = filters.sortOrder === "asc";

  switch (filters.sortBy) {
    case "amount":
      return query.order("amount", { ascending });
    case "title":
      return query.order("title", { ascending });
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

/** Builds a mock Supabase query chain that records method calls (for tests). */
export function createQueryRecorder(): {
  query: QueryChain;
  calls: Array<{ method: string; args: unknown[] }>;
} {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const query: QueryChain = {};

  const record =
    (method: string) =>
    (...args: unknown[]) => {
      calls.push({ method, args });
      return query;
    };

  for (const method of [
    "eq",
    "gte",
    "lte",
    "ilike",
    "in",
    "or",
    "not",
    "order",
    "limit",
    "range",
  ]) {
    query[method] = record(method);
  }

  return { query, calls };
}
