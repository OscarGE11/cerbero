import { z } from "zod";

function resolvePublicApiUrl(): string {
  const raw = process.env.PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
  const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();

  if (raw) {
    const trimmed = raw.trim();

    if (trimmed.startsWith("/")) {
      if (railwayDomain) {
        console.warn(
          `PUBLIC_API_URL is a path (${trimmed}), using https://${railwayDomain}`,
        );
        return `https://${railwayDomain}`;
      }
    } else {
      try {
        return new URL(trimmed).origin;
      } catch {
        console.warn(`PUBLIC_API_URL is not a valid URL: ${trimmed}`);
      }
    }
  }

  if (railwayDomain) {
    return `https://${railwayDomain}`;
  }

  return "http://localhost:3001";
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    PORT: z.coerce.number().default(3001),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    DASHBOARD_URL: z.string().url().default("http://localhost:3000"),
    PUBLIC_API_URL: z.string().url().default("http://localhost:3001"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().default("Cerbero <noreply@cerbero.app>"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV !== "production") return;

    if (!data.TELEGRAM_BOT_TOKEN) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TELEGRAM_BOT_TOKEN is required in production",
        path: ["TELEGRAM_BOT_TOKEN"],
      });
    }

    if (!data.TELEGRAM_WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "TELEGRAM_WEBHOOK_SECRET is required in production",
        path: ["TELEGRAM_WEBHOOK_SECRET"],
      });
    }
  });

function loadEnv() {
  const nodeEnv =
    process.env.NODE_ENV === "production" ? "production" : "development";

  return envSchema.parse({
    NODE_ENV: nodeEnv,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      process.env.SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    PORT: process.env.PORT,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    DASHBOARD_URL:
      process.env.DASHBOARD_URL ?? process.env.NEXT_PUBLIC_DASHBOARD_URL,
    PUBLIC_API_URL: resolvePublicApiUrl(),
    CORS_ORIGIN:
      process.env.CORS_ORIGIN ??
      process.env.DASHBOARD_URL ??
      process.env.NEXT_PUBLIC_DASHBOARD_URL ??
      "http://localhost:3000",
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_FROM: process.env.SMTP_FROM,
  });
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
