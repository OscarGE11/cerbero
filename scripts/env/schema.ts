import { z } from "zod";

export type CerberoEnv = "development" | "production";

const url = z.string().url();
const nonEmpty = z.string().min(1);

/** Variables compartidas (raíz / API) */
export const sharedEnvSchema = z.object({
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: nonEmpty,
  SUPABASE_SERVICE_ROLE_KEY: nonEmpty,
});

/** API — desarrollo */
export const apiDevEnvSchema = sharedEnvSchema.extend({
  NODE_ENV: z.literal("development").default("development"),
  PORT: z.coerce.number().default(3001),
  TELEGRAM_BOT_TOKEN: nonEmpty,
  DASHBOARD_URL: url.default("http://localhost:3000"),
  PUBLIC_API_URL: url.default("http://localhost:3001"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

/** API — producción */
export const apiProdEnvSchema = sharedEnvSchema.extend({
  NODE_ENV: z.literal("production"),
  PORT: z.coerce.number().default(3001),
  TELEGRAM_BOT_TOKEN: nonEmpty,
  DASHBOARD_URL: url,
  PUBLIC_API_URL: url,
  TELEGRAM_WEBHOOK_SECRET: nonEmpty,
  CORS_ORIGIN: url,
});

/** Dashboard — desarrollo */
export const dashboardDevEnvSchema = z.object({
  NODE_ENV: z.literal("development").default("development"),
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
  NEXT_PUBLIC_API_URL: url.default("http://localhost:3001"),
});

/** Dashboard — producción */
export const dashboardProdEnvSchema = z.object({
  NODE_ENV: z.literal("production"),
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: nonEmpty,
  NEXT_PUBLIC_API_URL: url,
});

/** Solo scripts locales — nunca en producción */
export const devOnlyEnvSchema = z.object({
  DEV_USER_EMAIL: z.string().email().optional(),
  DEV_USER_PASSWORD: z.string().min(1).optional(),
});

export type EnvVarMeta = {
  key: string;
  required: boolean;
  description: string;
  example?: string;
  secret?: boolean;
};

function schemaKeys(schema: z.ZodObject<z.ZodRawShape>): string[] {
  return Object.keys(schema.shape);
}

export const ENV_CATALOG: Record<
  CerberoEnv,
  { api: EnvVarMeta[]; dashboard: EnvVarMeta[]; devOnly?: EnvVarMeta[] }
> = {
  development: {
    api: [
      {
        key: "SUPABASE_URL",
        required: true,
        description: "URL del proyecto Supabase",
        example: "https://xxxx.supabase.co",
      },
      {
        key: "SUPABASE_ANON_KEY",
        required: true,
        description: "Clave anon/public de Supabase",
        secret: true,
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        required: true,
        description: "Service role (solo backend)",
        secret: true,
      },
      {
        key: "TELEGRAM_BOT_TOKEN",
        required: true,
        description: "Token de @BotFather",
        secret: true,
      },
      {
        key: "PORT",
        required: false,
        description: "Puerto API",
        example: "3001",
      },
      {
        key: "DASHBOARD_URL",
        required: false,
        description: "URL del dashboard (enlaces del bot)",
        example: "http://localhost:3000",
      },
      {
        key: "PUBLIC_API_URL",
        required: false,
        description: "URL pública de la API",
        example: "http://localhost:3001",
      },
      {
        key: "CORS_ORIGIN",
        required: false,
        description: "Origen permitido en CORS",
        example: "http://localhost:3000",
      },
    ],
    dashboard: [
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        required: true,
        description: "Misma URL que SUPABASE_URL",
        example: "https://xxxx.supabase.co",
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        required: true,
        description: "Misma clave que SUPABASE_ANON_KEY",
        secret: true,
      },
      {
        key: "NEXT_PUBLIC_API_URL",
        required: false,
        description: "URL de la API",
        example: "http://localhost:3001",
      },
    ],
    devOnly: [
      {
        key: "DEV_USER_EMAIL",
        required: false,
        description: "Usuario de prueba para scripts auth:*",
      },
      {
        key: "DEV_USER_PASSWORD",
        required: false,
        description: "Contraseña de prueba para scripts auth:*",
        secret: true,
      },
    ],
  },
  production: {
    api: [
      {
        key: "NODE_ENV",
        required: true,
        description: "Debe ser 'production'",
        example: "production",
      },
      {
        key: "SUPABASE_URL",
        required: true,
        description: "URL del proyecto Supabase",
      },
      {
        key: "SUPABASE_ANON_KEY",
        required: true,
        description: "Clave anon de Supabase",
        secret: true,
      },
      {
        key: "SUPABASE_SERVICE_ROLE_KEY",
        required: true,
        description: "Service role (solo Railway)",
        secret: true,
      },
      {
        key: "TELEGRAM_BOT_TOKEN",
        required: true,
        description: "Token de @BotFather",
        secret: true,
      },
      {
        key: "DASHBOARD_URL",
        required: true,
        description: "URL pública del dashboard (Vercel)",
        example: "https://cerbero.vercel.app",
      },
      {
        key: "PUBLIC_API_URL",
        required: true,
        description: "URL pública de la API (Railway)",
        example: "https://cerbero-api.up.railway.app",
      },
      {
        key: "TELEGRAM_WEBHOOK_SECRET",
        required: true,
        description: "Secreto aleatorio para validar webhooks de Telegram",
        secret: true,
      },
      {
        key: "CORS_ORIGIN",
        required: true,
        description: "Misma URL que DASHBOARD_URL",
        example: "https://cerbero.vercel.app",
      },
      {
        key: "PORT",
        required: false,
        description: "Railway lo inyecta automáticamente",
      },
    ],
    dashboard: [
      {
        key: "NODE_ENV",
        required: true,
        description: "Debe ser 'production'",
        example: "production",
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_URL",
        required: true,
        description: "URL de Supabase",
      },
      {
        key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        required: true,
        description: "Clave anon de Supabase",
        secret: true,
      },
      {
        key: "NEXT_PUBLIC_API_URL",
        required: true,
        description: "URL pública de la API en Railway",
        example: "https://cerbero-api.up.railway.app",
      },
    ],
  },
};

export function getApiSchema(env: CerberoEnv) {
  return env === "production" ? apiProdEnvSchema : apiDevEnvSchema;
}

export function getDashboardSchema(env: CerberoEnv) {
  return env === "production" ? dashboardProdEnvSchema : dashboardDevEnvSchema;
}

export function resolveCerberoEnv(value?: string): CerberoEnv {
  const raw =
    value ?? process.env.CERBERO_ENV ?? process.env.NODE_ENV ?? "development";
  if (raw === "production" || raw === "prod") return "production";
  return "development";
}

/** Normaliza variables del .env raíz para validación del dashboard */
export function normalizeDashboardEnv(
  source: Record<string, string | undefined>,
): Record<string, string | undefined> {
  return {
    NODE_ENV: source.NODE_ENV,
    NEXT_PUBLIC_SUPABASE_URL:
      source.NEXT_PUBLIC_SUPABASE_URL ?? source.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? source.SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: source.NEXT_PUBLIC_API_URL,
  };
}

/** Normaliza variables del .env raíz para validación de la API */
export function normalizeApiEnv(
  source: Record<string, string | undefined>,
): Record<string, string | undefined> {
  return {
    NODE_ENV: source.NODE_ENV,
    SUPABASE_URL: source.SUPABASE_URL,
    SUPABASE_ANON_KEY:
      source.SUPABASE_ANON_KEY ?? source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: source.SUPABASE_SERVICE_ROLE_KEY,
    PORT: source.PORT,
    TELEGRAM_BOT_TOKEN: source.TELEGRAM_BOT_TOKEN,
    DASHBOARD_URL: source.DASHBOARD_URL ?? source.NEXT_PUBLIC_DASHBOARD_URL,
    PUBLIC_API_URL: source.PUBLIC_API_URL ?? source.NEXT_PUBLIC_API_URL,
    TELEGRAM_WEBHOOK_SECRET: source.TELEGRAM_WEBHOOK_SECRET,
    CORS_ORIGIN: source.CORS_ORIGIN ?? source.DASHBOARD_URL,
  };
}

export function requiredKeys(
  env: CerberoEnv,
  target: "api" | "dashboard",
): string[] {
  const schema = target === "api" ? getApiSchema(env) : getDashboardSchema(env);
  return schemaKeys(schema as z.ZodObject<z.ZodRawShape>);
}
