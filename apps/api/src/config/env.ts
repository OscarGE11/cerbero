import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PORT: z.coerce.number().default(3001),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  DASHBOARD_URL: z.string().url().default("http://localhost:3000"),
});

function loadEnv() {
  return envSchema.parse({
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PORT: process.env.PORT,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DASHBOARD_URL:
      process.env.DASHBOARD_URL ?? process.env.NEXT_PUBLIC_DASHBOARD_URL,
  });
}

export const env = loadEnv();
