import type { Context } from "hono";
import { createUserSupabase } from "../config/supabase.js";
import * as categoriesService from "../services/categories.js";
import type { AppVariables } from "../types/index.js";

type CategoriesContext = Context<{ Variables: AppVariables }>;

export async function getCategories(c: CategoriesContext) {
  try {
    const supabase = createUserSupabase(c.get("accessToken"));
    const categories = await categoriesService.listCategories(supabase);
    return c.json(categories);
  } catch (error) {
    console.error("GET /categories failed:", error);
    return c.json({ error: "Failed to fetch categories" }, 500);
  }
}
