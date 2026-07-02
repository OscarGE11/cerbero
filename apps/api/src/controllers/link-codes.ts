import type { Context } from "hono";
import { createUserSupabase } from "../config/supabase.js";
import * as telegramService from "../services/telegram.js";
import type { AppVariables } from "../types/index.js";

type LinkCodesContext = Context<{ Variables: AppVariables }>;

export async function postLinkCode(c: LinkCodesContext) {
  try {
    const supabase = createUserSupabase(c.get("accessToken"));
    const result = await telegramService.createLinkCodeForUser(
      supabase,
      c.get("userId"),
    );
    return c.json(result, 201);
  } catch (error) {
    console.error("POST /link-codes failed:", error);
    return c.json({ error: "Failed to create link code" }, 500);
  }
}
