import { type SupabaseClient, createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

export function createUserSupabase(accessToken: string): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });
}

export function createAuthSupabase(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
}

export function createAdminSupabase(): SupabaseClient {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}
