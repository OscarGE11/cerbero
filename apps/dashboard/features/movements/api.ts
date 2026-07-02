import { fetchApi } from "@/lib/api/client";
import type { Category, MonthSummary, PaginatedResult } from "@cerbero/shared";
import type { Movement } from "@cerbero/shared";

export async function getMovements(
  accessToken: string,
  params: { page?: number; pageSize?: number } = {},
): Promise<PaginatedResult<Movement>> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));

  const query = search.toString();
  return fetchApi<PaginatedResult<Movement>>(
    `/movements${query ? `?${query}` : ""}`,
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
