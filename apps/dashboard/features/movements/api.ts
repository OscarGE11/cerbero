import { fetchApi } from "@/lib/api/client";
import type {
  Category,
  MonthSummary,
  MovementQueryParams,
  PaginatedResult,
} from "@cerbero/shared";
import type { Movement } from "@cerbero/shared";

function buildMovementsQuery(params: MovementQueryParams = {}): string {
  const search = new URLSearchParams();

  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.title) search.set("title", params.title);
  if (params.comment) search.set("comment", params.comment);
  if (params.categoryIds?.length) {
    search.set("categoryIds", params.categoryIds.join(","));
  }
  if (params.customCategory) {
    search.set("customCategory", params.customCategory);
  }
  if (params.includeCustom) search.set("includeCustom", "true");
  if (params.minAmount !== undefined) {
    search.set("minAmount", String(params.minAmount));
  }
  if (params.maxAmount !== undefined) {
    search.set("maxAmount", String(params.maxAmount));
  }
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortOrder) search.set("sortOrder", params.sortOrder);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.type) search.set("type", params.type);

  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getMovements(
  accessToken: string,
  params: MovementQueryParams = {},
): Promise<PaginatedResult<Movement>> {
  return fetchApi<PaginatedResult<Movement>>(
    `/movements${buildMovementsQuery(params)}`,
    accessToken,
  );
}

export async function getMonthSummary(
  accessToken: string,
  month?: string,
): Promise<MonthSummary> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return fetchApi<MonthSummary>(`/movements/summary${query}`, accessToken);
}

export async function getCategories(accessToken: string): Promise<Category[]> {
  return fetchApi<Category[]>("/categories", accessToken);
}
