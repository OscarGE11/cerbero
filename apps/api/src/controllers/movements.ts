import type { Context } from "hono";
import { createUserSupabase } from "../config/supabase.js";
import { handleControllerError } from "../lib/http-errors.js";
import * as movementsService from "../services/movements.js";
import type { AppVariables } from "../types/index.js";

type MovementsContext = Context<{ Variables: AppVariables }>;

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
      title: c.req.query("title"),
      categoryIds: c.req.query("categoryIds"),
      customCategory: c.req.query("customCategory"),
      includeCustom: c.req.query("includeCustom"),
      minAmount: c.req.query("minAmount"),
      maxAmount: c.req.query("maxAmount"),
      sortBy: c.req.query("sortBy"),
      sortOrder: c.req.query("sortOrder"),
    });

    const supabase = createUserSupabase(c.get("accessToken"));
    const result = await movementsService.listMovementsPaginated(
      supabase,
      c.get("userId"),
      filters,
    );
    return c.json(result);
  } catch (error) {
    return handleControllerError(c, error, "Movements request failed");
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
    return handleControllerError(c, error, "Movements request failed");
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
    return handleControllerError(c, error, "Movements request failed");
  }
}

export async function deleteMovement(c: MovementsContext) {
  try {
    const supabase = createUserSupabase(c.get("accessToken"));
    await movementsService.deleteMovement(
      supabase,
      c.get("userId"),
      c.req.param("id"),
    );
    return c.body(null, 204);
  } catch (error) {
    return handleControllerError(c, error, "Delete movement failed");
  }
}
