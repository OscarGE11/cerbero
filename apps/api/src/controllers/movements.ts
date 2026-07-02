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
    });

    const supabase = createUserSupabase(c.get("accessToken"));
    const movements = await movementsService.listMovements(
      supabase,
      c.get("userId"),
      filters,
    );
    return c.json(movements);
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
