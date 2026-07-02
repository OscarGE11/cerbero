import type { MonthSummary, PaginatedResult } from "@cerbero/shared";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import * as movementsRepository from "../repositories/movements.js";
import type {
  CreateMovementDto,
  Movement,
  MovementFilters,
} from "../types/index.js";

const movementTypeSchema = z.enum(["expense", "income"]);

const createMovementSchema = z
  .object({
    type: movementTypeSchema,
    title: z.string().trim().min(1, "Title is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    categoryId: z.string().uuid().optional(),
    customCategory: z.string().trim().min(1).optional(),
    comment: z.string().trim().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .optional(),
  })
  .refine(
    (data) => !(data.categoryId && data.customCategory),
    "Provide either categoryId or customCategory, not both",
  );

const movementFiltersSchema = z.object({
  type: movementTypeSchema.optional(),
  categoryId: z.string().uuid().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(50).optional(),
});

export function parseCreateMovementDto(input: unknown): CreateMovementDto {
  return createMovementSchema.parse(input);
}

export function parseMovementFilters(input: {
  type?: string;
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: string;
  page?: string;
  pageSize?: string;
}): MovementFilters {
  return movementFiltersSchema.parse({
    type: input.type,
    categoryId: input.categoryId,
    from: input.from,
    to: input.to,
    limit: input.limit,
    page: input.page,
    pageSize: input.pageSize,
  });
}

export async function listMovementsPaginated(
  supabase: SupabaseClient,
  userId: string,
  filters: MovementFilters,
): Promise<PaginatedResult<Movement>> {
  return movementsRepository.findMovementsPaginated(supabase, userId, filters);
}

export async function listMovements(
  supabase: SupabaseClient,
  userId: string,
  filters: MovementFilters,
): Promise<Movement[]> {
  return movementsRepository.findMovements(supabase, userId, filters);
}

function getMonthDateRange(month: string): { from: string; to: string } {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export async function getMonthSummary(
  supabase: SupabaseClient,
  userId: string,
  month?: string,
): Promise<MonthSummary> {
  const targetMonth =
    month ??
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const { from, to } = getMonthDateRange(targetMonth);
  const movements = await movementsRepository.findMovements(supabase, userId, {
    from,
    to,
    limit: 1000,
  });

  const expenses = movements
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);
  const income = movements
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + m.amount, 0);

  return {
    month: targetMonth,
    expenses,
    income,
    balance: income - expenses,
  };
}

export async function createMovement(
  supabase: SupabaseClient,
  userId: string,
  dto: CreateMovementDto,
): Promise<Movement> {
  const validated = createMovementSchema.parse(dto);
  return movementsRepository.insertMovement(supabase, userId, validated);
}
