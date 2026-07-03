export type MovementType = "expense" | "income";

export interface Movement {
  id: string;
  userId: string;
  type: MovementType;
  title: string;
  amount: number;
  categoryId?: string;
  customCategory?: string;
  date: string;
  createdAt: string;
}

export interface CreateMovementDto {
  type: MovementType;
  title: string;
  amount: number;
  categoryId?: string;
  customCategory?: string;
  date?: string;
}
