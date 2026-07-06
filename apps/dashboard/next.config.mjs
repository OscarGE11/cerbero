import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnvPath = resolve(__dirname, "../../.env");

function loadRootEnv() {
  if (!existsSync(rootEnvPath)) return {};

  const vars = {};

  for (const line of readFileSync(rootEnvPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    vars[key] = value;
  }

  return vars;
}

const rootEnv = loadRootEnv();

function pick(...keys) {
  for (const key of keys) {
    if (process.env[key]) return process.env[key];
    if (rootEnv[key]) return rootEnv[key];
  }
  return undefined;
}

const supabaseUrl = pick("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
const supabaseAnonKey = pick(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_ANON_KEY",
);
const apiUrl = pick("NEXT_PUBLIC_API_URL") ?? "http://localhost:3001";
const dashboardUrl =
  pick("NEXT_PUBLIC_DASHBOARD_URL", "DASHBOARD_URL") ??
  "http://localhost:3000";
const telegramWebAppUrl =
  pick("NEXT_PUBLIC_TELEGRAM_WEBAPP_URL") ?? `${dashboardUrl}/telegram`;

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    NEXT_PUBLIC_API_URL: apiUrl,
    NEXT_PUBLIC_DASHBOARD_URL: dashboardUrl,
    NEXT_PUBLIC_TELEGRAM_WEBAPP_URL: telegramWebAppUrl,
  },
};

export default nextConfig;
