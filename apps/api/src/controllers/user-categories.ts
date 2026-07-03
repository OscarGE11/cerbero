import type { Context } from "hono";
import { createUserSupabase } from "../config/supabase.js";
import * as userCategoriesService from "../services/user-categories.js";
import type { AppVariables } from "../types/index.js";

type UserCategoriesContext = Context<{ Variables: AppVariables }>;

export async function getUserCategories(c: UserCategoriesContext) {
  try {
    const rawType = c.req.query("type");
    if (rawType !== "expense" && rawType !== "income") {
      return c.json({ error: "type query parameter is required" }, 400);
    }

    const supabase = createUserSupabase(c.get("accessToken"));
    const categories = await userCategoriesService.listUserCategories(
      supabase,
      c.get("userId"),
      rawType,
    );
    return c.json(categories);
  } catch (error) {
    console.error("GET /user-categories failed:", error);
    return c.json({ error: "Failed to fetch user categories" }, 500);
  }
}
