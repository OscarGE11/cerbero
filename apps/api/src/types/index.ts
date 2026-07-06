export type {
  Category,
  CreateMovementDto,
  Movement,
  MovementType,
  UserCategory,
} from "@cerbero/shared";

export interface AppVariables {
  userId: string;
  accessToken: string;
}

export interface TelegramWebAppUserContext {
  telegramId: number;
  telegramUsername?: string;
  firstName?: string;
}

export interface TelegramAppVariables {
  userId: string;
  telegramId: number;
  telegramUser: TelegramWebAppUserContext;
  accessToken?: string;
}

import type { MovementSortField, SortOrder } from "@cerbero/shared";

export interface MovementFilters {
  type?: "expense" | "income";
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
  title?: string;
  categoryIds?: string[];
  customCategory?: string;
  includeCustom?: boolean;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: MovementSortField;
  sortOrder?: SortOrder;
}
