import type { Context } from "hono";
import { ZodError } from "zod";
import { createUserSupabase } from "../config/supabase.js";
import * as movementsService from "../services/movements.js";
import type { AppVariables } from "../types/index.js";

type MovementsContext = Context<{ Variables: AppVariables }>;

function handleError(c: MovementsContext, error: unknown) {
  if (error instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      },
      400,
    );
  }

  console.error("Movements request failed:", error);
  return c.json({ error: "Internal server error" }, 500);
}

export async function getMovements(c: MovementsContext) {
  try {
    const filters = movementsService.parseMovementFilters({
      type: c.req.query("type"),
      categoryId: c.req.query("categoryId"),
      from: c.req.query("from"),
      to: c.req.query("to"),
      limit: c.req.query("limit"),
      page: c.req.query("page"),
      pageSize: c.req.query("pageSize"),
    });

    const supabase = createUserSupabase(c.get("accessToken"));
    const result = await movementsService.listMovementsPaginated(
      supabase,
      c.get("userId"),
      filters,
    );
    return c.json(result);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function getMonthSummary(c: MovementsContext) {
  try {
    const supabase = createUserSupabase(c.get("accessToken"));
    const summary = await movementsService.getMonthSummary(
      supabase,
      c.get("userId"),
      c.req.query("month"),
    );
    return c.json(summary);
  } catch (error) {
    return handleError(c, error);
  }
}

export async function postMovement(c: MovementsContext) {
  try {
    const body = await c.req.json();
    const dto = movementsService.parseCreateMovementDto(body);
    const supabase = createUserSupabase(c.get("accessToken"));
    const movement = await movementsService.createMovement(
      supabase,
      c.get("userId"),
      dto,
    );
    return c.json(movement, 201);
  } catch (error) {
    return handleError(c, error);
  }
}
