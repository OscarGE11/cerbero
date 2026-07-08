import type { Context } from "hono";
import { createAdminSupabase } from "../config/supabase.js";
import { createAuthSupabase } from "../config/supabase.js";
import { handleControllerError } from "../lib/http-errors.js";
import { getTelegramUser } from "../middleware/telegram-init-data.js";
import * as categoriesService from "../services/categories.js";
import * as movementsService from "../services/movements.js";
import * as telegramService from "../services/telegram.js";
import * as userCategoriesService from "../services/user-categories.js";
import type { TelegramAppVariables } from "../types/index.js";

type TelegramContext = Context<{ Variables: TelegramAppVariables }>;

export async function getTelegramMe(c: TelegramContext) {
  try {
    const telegramUser = getTelegramUser(c);
    if (!telegramUser) {
      return c.json({ error: "INVALID_INIT_DATA" }, 401);
    }

    const supabase = createAdminSupabase();
    const linkedUser = await telegramService.getLinkedUser(
      supabase,
      telegramUser.telegramId,
    );

    if (!linkedUser) {
      return c.json({
        linked: false,
        telegramId: telegramUser.telegramId,
      });
    }

    return c.json({
      linked: true,
      userId: linkedUser.userId,
      telegramId: linkedUser.telegramId,
      ...(linkedUser.telegramUsername
        ? { telegramUsername: linkedUser.telegramUsername }
        : {}),
    });
  } catch (error) {
    return handleControllerError(c, error, "Telegram me request failed");
  }
}

export async function postTelegramLink(c: TelegramContext) {
  try {
    const telegramUser = getTelegramUser(c);
    if (!telegramUser) {
      return c.json({ error: "INVALID_INIT_DATA" }, 401);
    }

    const header = c.req.header("Authorization");
    if (!header?.startsWith("Bearer ")) {
      return c.json({ error: "Missing or invalid Authorization header" }, 401);
    }

    const accessToken = header.slice("Bearer ".length).trim();
    if (!accessToken) {
      return c.json({ error: "Missing access token" }, 401);
    }

    const authSupabase = createAuthSupabase();
    const {
      data: { user },
      error: authError,
    } = await authSupabase.auth.getUser(accessToken);

    if (authError || !user) {
      return c.json({ error: "Invalid or expired token" }, 401);
    }

    const supabase = createAdminSupabase();
    const linked = await telegramService.linkTelegramFromWebApp(supabase, {
      userId: user.id,
      telegramId: telegramUser.telegramId,
      telegramUsername: telegramUser.telegramUsername,
    });

    return c.json({
      linked: true,
      userId: linked.userId,
      telegramId: linked.telegramId,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TELEGRAM_ALREADY_LINKED") {
        return c.json(
          { error: "Este Telegram ya está vinculado a otra cuenta." },
          409,
        );
      }
      if (error.message === "USER_ALREADY_LINKED") {
        return c.json(
          { error: "Tu cuenta web ya tiene otro Telegram vinculado." },
          409,
        );
      }
    }
    return handleControllerError(c, error, "Telegram link request failed");
  }
}

export async function deleteTelegramLink(c: TelegramContext) {
  try {
    const telegramUser = getTelegramUser(c);
    if (!telegramUser) {
      return c.json({ error: "INVALID_INIT_DATA" }, 401);
    }

    const supabase = createAdminSupabase();
    try {
      await telegramService.unlinkTelegram(supabase, telegramUser.telegramId);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_LINKED") {
        return c.body(null, 204);
      }
      throw error;
    }

    return c.body(null, 204);
  } catch (error) {
    return handleControllerError(c, error, "Telegram unlink request failed");
  }
}

export async function getTelegramMovements(c: TelegramContext) {
  try {
    const supabase = createAdminSupabase();
    const filters = movementsService.parseMovementFilters({
      limit: c.req.query("limit") ?? "5",
      page: c.req.query("page"),
      pageSize: c.req.query("pageSize"),
      type: c.req.query("type"),
      from: c.req.query("from"),
      to: c.req.query("to"),
      sortBy: c.req.query("sortBy"),
      sortOrder: c.req.query("sortOrder"),
    });

    const result = await movementsService.listMovementsPaginated(
      supabase,
      c.get("userId"),
      filters,
    );
    return c.json(result);
  } catch (error) {
    return handleControllerError(c, error, "Telegram movements request failed");
  }
}

export async function postTelegramMovement(c: TelegramContext) {
  try {
    const body = await c.req.json();
    const dto = movementsService.parseCreateMovementDto(body);
    const supabase = createAdminSupabase();
    const movement = await movementsService.createMovement(
      supabase,
      c.get("userId"),
      dto,
    );
    return c.json(movement, 201);
  } catch (error) {
    return handleControllerError(c, error, "Telegram movement create failed");
  }
}

export async function deleteTelegramMovement(c: TelegramContext) {
  try {
    const id = c.req.param("id");
    const supabase = createAdminSupabase();
    await movementsService.deleteMovement(supabase, c.get("userId"), id);
    return c.body(null, 204);
  } catch (error) {
    return handleControllerError(c, error, "Telegram movement delete failed");
  }
}

export async function getTelegramSummary(c: TelegramContext) {
  try {
    const supabase = createAdminSupabase();
    const summary = await movementsService.getMonthSummary(
      supabase,
      c.get("userId"),
      c.req.query("month"),
    );
    return c.json(summary);
  } catch (error) {
    return handleControllerError(c, error, "Telegram summary request failed");
  }
}

export async function getTelegramCategories(c: TelegramContext) {
  try {
    const type = c.req.query("type");
    const movementType =
      type === "expense" || type === "income" ? type : undefined;
    const supabase = createAdminSupabase();
    const categories = await categoriesService.listCategories(
      supabase,
      movementType,
    );
    return c.json(categories);
  } catch (error) {
    return handleControllerError(
      c,
      error,
      "Telegram categories request failed",
    );
  }
}

export async function getTelegramUserCategories(c: TelegramContext) {
  try {
    const rawType = c.req.query("type");
    if (rawType !== "expense" && rawType !== "income") {
      return c.json({ error: "type query parameter is required" }, 400);
    }

    const supabase = createAdminSupabase();
    const categories = await userCategoriesService.listUserCategories(
      supabase,
      c.get("userId"),
      rawType,
    );
    return c.json(categories);
  } catch (error) {
    return handleControllerError(
      c,
      error,
      "Telegram user categories request failed",
    );
  }
}
