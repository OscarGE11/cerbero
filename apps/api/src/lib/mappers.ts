import type { Category, Movement, UserCategory } from "@cerbero/shared";

export interface CategoryRow {
  id: string;
  name: string;
  type: string;
  icon: string | null;
}

export interface MovementRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  amount: number;
  category_id: string | null;
  custom_category: string | null;
  comment: string | null;
  date: string;
  created_at: string;
}

export interface UserCategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: string;
  use_count: number;
  last_used_at: string;
  created_at: string;
}

export function toCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Category["type"],
    ...(row.icon ? { icon: row.icon } : {}),
  };
}

export function toUserCategory(row: UserCategoryRow): UserCategory {
  return {
    id: row.id,
    name: row.name,
    type: row.type as UserCategory["type"],
    useCount: row.use_count,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
  };
}

export function toMovement(row: MovementRow): Movement {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as Movement["type"],
    title: row.title,
    amount: Number(row.amount),
    ...(row.category_id ? { categoryId: row.category_id } : {}),
    ...(row.custom_category ? { customCategory: row.custom_category } : {}),
    ...(row.comment ? { comment: row.comment } : {}),
    date: row.date,
    createdAt: row.created_at,
  };
}
