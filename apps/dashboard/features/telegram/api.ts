import { fetchTelegramApi } from "@/lib/telegram/api-client";
import type {
  Category,
  CreateMovementDto,
  MonthSummary,
  Movement,
  MovementType,
  PaginatedResult,
  UserCategory,
} from "@cerbero/shared";

export interface TelegramMeResponse {
  linked: boolean;
  userId?: string;
  telegramId: number;
  telegramUsername?: string;
}

export interface TelegramLinkResponse {
  linked: boolean;
  userId: string;
  telegramId: number;
}

export async function getTelegramMe(
  initData: string,
): Promise<TelegramMeResponse> {
  return fetchTelegramApi<TelegramMeResponse>("/telegram/me", initData);
}

export async function linkTelegramAccount(
  initData: string,
  accessToken: string,
): Promise<TelegramLinkResponse> {
  return fetchTelegramApi<TelegramLinkResponse>("/telegram/link", initData, {
    method: "POST",
    accessToken,
  });
}

export async function unlinkTelegramAccount(initData: string): Promise<void> {
  await fetchTelegramApi<void>("/telegram/link", initData, {
    method: "DELETE",
  });
}

export async function getTelegramCategories(
  initData: string,
  type: MovementType,
): Promise<Category[]> {
  return fetchTelegramApi<Category[]>(
    `/telegram/categories?type=${type}`,
    initData,
  );
}

export async function getTelegramUserCategories(
  initData: string,
  type: MovementType,
): Promise<UserCategory[]> {
  return fetchTelegramApi<UserCategory[]>(
    `/telegram/user-categories?type=${type}`,
    initData,
  );
}

export async function createTelegramMovement(
  initData: string,
  dto: CreateMovementDto,
): Promise<Movement> {
  return fetchTelegramApi<Movement>("/telegram/movements", initData, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteTelegramMovement(
  initData: string,
  id: string,
): Promise<void> {
  await fetchTelegramApi<void>(`/telegram/movements/${id}`, initData, {
    method: "DELETE",
  });
}

export async function getTelegramMovements(
  initData: string,
  limit = 5,
): Promise<PaginatedResult<Movement>> {
  return fetchTelegramApi<PaginatedResult<Movement>>(
    `/telegram/movements?limit=${limit}`,
    initData,
  );
}

export async function getTelegramSummary(
  initData: string,
  month?: string,
): Promise<MonthSummary> {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return fetchTelegramApi<MonthSummary>(`/telegram/summary${query}`, initData);
}
