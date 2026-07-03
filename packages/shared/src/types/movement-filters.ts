export type MovementSortField =
  | "amount"
  | "title"
  | "createdAt"
  | "date"
  | "category";

export type SortOrder = "asc" | "desc";

export type MovementQueryParams = {
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
  from?: string;
  to?: string;
  type?: "expense" | "income";
};
