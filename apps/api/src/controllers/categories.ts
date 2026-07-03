import type { Context } from "hono";
import { createUserSupabase } from "../config/supabase.js";
import * as categoriesService from "../services/categories.js";
import type { AppVariables } from "../types/index.js";

type CategoriesContext = Context<{ Variables: AppVariables }>;

export async function getCategories(c: CategoriesContext) {
  try {
    const rawType = c.req.query("type");
    if (rawType && rawType !== "expense" && rawType !== "income") {
      return c.json({ error: "Invalid type parameter" }, 400);
    }

    const type =
      rawType === "expense" || rawType === "income" ? rawType : undefined;
    const supabase = createUserSupabase(c.get("accessToken"));
    const categories = await categoriesService.listCategories(supabase, type);
    return c.json(categories);
  } catch (error) {
    console.error("GET /categories failed:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
}
