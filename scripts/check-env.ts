#!/usr/bin/env bun
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { z } from "zod";
import {
  type CerberoEnv,
  ENV_CATALOG,
  getApiSchema,
  getDashboardSchema,
  normalizeApiEnv,
  normalizeDashboardEnv,
  resolveCerberoEnv,
} from "./env/schema.js";

type Target = "api" | "dashboard" | "all";

function parseArgs() {
  const args = Bun.argv.slice(2);
  let env: CerberoEnv | undefined;
  let target: Target = "all";
  let printOnly = false;
  let fromFile = true;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--env" || arg === "-e") {
      env = resolveCerberoEnv(args[++i]);
    } else if (arg === "--target" || arg === "-t") {
      const value = args[++i] as Target;
      if (!["api", "dashboard", "all"].includes(value)) {
        console.error(`Target inválido: ${value}`);
        process.exit(1);
      }
      target = value;
    } else if (arg === "--print" || arg === "-p") {
      printOnly = true;
    } else if (arg === "--process") {
      fromFile = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }
  }

  return {
    env: env ?? resolveCerberoEnv(),
    target,
    printOnly,
    fromFile,
  };
}

function printHelp() {
  console.log(`
Cerbero — comprobación de variables de entorno

Uso:
  bun run env:check                          # valida .env en desarrollo
  bun run env:check -- --env production      # valida vars de producción
  bun run env:check -- --env production --process  # valida process.env (Railway/Vercel)
  bun run env:check -- --print               # solo muestra el catálogo
  bun run env:check -- --target api          # solo API

Opciones:
  --env, -e       development | production  (default: development o CERBERO_ENV)
  --target, -t    api | dashboard | all     (default: all)
  --print, -p     muestra qué variables configurar sin validar
  --process       lee process.env en lugar del archivo .env
  --help, -h      esta ayuda
`);
}

function loadDotEnv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};

  const vars: Record<string, string> = {};

  for (const line of readFileSync(path, "utf8").split("\n")) {
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

function mask(value: string | undefined): string {
  if (!value) return "(vacío)";
  if (value.length <= 8) return "****";
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function printCatalog(env: CerberoEnv, target: Target) {
  const catalog = ENV_CATALOG[env];
  const sections: Array<{ name: string; items: typeof catalog.api }> = [];

  if (target === "api" || target === "all") {
    sections.push({ name: "API (Railway)", items: catalog.api });
  }
  if (target === "dashboard" || target === "all") {
    sections.push({ name: "Dashboard (Vercel)", items: catalog.dashboard });
  }
  if (env === "development" && catalog.devOnly && target === "all") {
    sections.push({
      name: "Solo desarrollo (scripts)",
      items: catalog.devOnly,
    });
  }

  console.log(`\nCerbero — variables de entorno (${env})\n`);

  for (const section of sections) {
    console.log(`## ${section.name}\n`);
    for (const item of section.items) {
      const req = item.required ? "requerida" : "opcional";
      const secret = item.secret ? " · secreto" : "";
      console.log(`  ${item.key} (${req}${secret})`);
      console.log(`    ${item.description}`);
      if (item.example) console.log(`    ej: ${item.example}`);
      console.log("");
    }
  }
}

function formatZodError(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".") || "(root)";
    return `  ✗ ${path}: ${issue.message}`;
  });
}

function validateBlock(
  label: string,
  schema: z.ZodTypeAny,
  source: Record<string, string | undefined>,
) {
  const result = schema.safeParse(source);

  console.log(`\n── ${label} ──`);

  if (result.success) {
    console.log(
      "  ✓ Todas las variables requeridas están presentes y son válidas",
    );
    return true;
  }

  console.log("  ✗ Faltan variables o tienen formato incorrecto:\n");
  for (const line of formatZodError(result.error)) {
    console.log(line);
  }
  return false;
}

function showLoadedSummary(
  env: CerberoEnv,
  target: Target,
  source: Record<string, string | undefined>,
) {
  const catalog = ENV_CATALOG[env];
  const keys = new Set<string>();

  if (target === "api" || target === "all") {
    for (const item of catalog.api) keys.add(item.key);
  }
  if (target === "dashboard" || target === "all") {
    for (const item of catalog.dashboard) keys.add(item.key);
  }

  console.log("\n── Resumen ──");
  for (const key of [...keys].sort()) {
    const meta = [...catalog.api, ...catalog.dashboard].find(
      (m) => m.key === key,
    );
    const value = source[key];
    const status = value ? "✓" : meta?.required ? "✗" : "·";
    const display = meta?.secret ? mask(value) : (value ?? "(no definida)");
    console.log(`  ${status} ${key}: ${display}`);
  }
}

const { env, target, printOnly, fromFile } = parseArgs();

if (printOnly) {
  printCatalog(env, target);
  process.exit(0);
}

const rootDir = resolve(import.meta.dir, "..");
const dotEnvPath = resolve(rootDir, ".env");
const source = fromFile
  ? loadDotEnv(dotEnvPath)
  : (process.env as Record<string, string | undefined>);

if (fromFile && !existsSync(dotEnvPath)) {
  console.error(`\nNo se encontró ${dotEnvPath}`);
  console.error("Copia .env.example → .env y rellena los valores.\n");
  printCatalog(env, target);
  process.exit(1);
}

if (fromFile) {
  console.log(`\nValidando ${dotEnvPath} como entorno: ${env}`);
} else {
  console.log(`\nValidando process.env como entorno: ${env}`);
}

let ok = true;

if (target === "api" || target === "all") {
  const apiOk = validateBlock(
    "API",
    getApiSchema(env),
    normalizeApiEnv({ ...source, NODE_ENV: env }),
  );
  ok &&= apiOk;
}

if (target === "dashboard" || target === "all") {
  const dashboardOk = validateBlock(
    "Dashboard",
    getDashboardSchema(env),
    normalizeDashboardEnv({ ...source, NODE_ENV: env }),
  );
  ok &&= dashboardOk;
}

showLoadedSummary(env, target, source);

if (!ok) {
  console.log("\n→ Ejecuta `bun run env:print` para ver el catálogo completo.");
  console.log(
    "→ En producción: configura las variables en Railway (API) y Vercel (dashboard).\n",
  );
  process.exit(1);
}

console.log("\n✓ Entorno listo.\n");
process.exit(0);
