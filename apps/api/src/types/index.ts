export type {
  Category,
  CreateMovementDto,
  Movement,
  MovementType,
} from "@cerbero/shared";

export interface AppVariables {
  userId: string;
  accessToken: string;
}

export interface MovementFilters {
  type?: "expense" | "income";
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  page?: number;
  pageSize?: number;
}
