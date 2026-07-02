import type { Context, Next } from "hono";
import { createAuthSupabase } from "../config/supabase.js";
import type { AppVariables } from "../types/index.js";

type AuthContext = Context<{ Variables: AppVariables }>;

export async function authMiddleware(c: AuthContext, next: Next) {
  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  const accessToken = header.slice("Bearer ".length).trim();

  if (!accessToken) {
    return c.json({ error: "Missing access token" }, 401);
  }

  const supabase = createAuthSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("userId", user.id);
  c.set("accessToken", accessToken);

  await next();
}
