import { env } from "../../config/env.js";

function getWebAppBaseUrl(): string {
  return `${env.DASHBOARD_URL.replace(/\/$/, "")}/telegram`;
}

export function getTelegramWebAppUrl(path = ""): string {
  const base = getWebAppBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Comandos disponibles con cuenta vinculada. */
export function formatLinkedCommandsHelp(): string {
  return [
    "Registros",
    "/add — Añadir gasto o ingreso (Web App)",
    "/last — Últimos 5 movimientos",
    "/month — Resumen del mes actual",
    "",
    "Panel web",
    `/dashboard — Abrir ${getDashboardUrl()}`,
    "",
    "Cuenta",
    "/unlink — Desvincular este Telegram",
  ].join("\n");
}

/** Onboarding para usuarios sin vincular. */
export function formatGuestCommandsHelp(): string {
  return [
    "Primeros pasos",
    "1. /login — Abre la Web App para registrarte o iniciar sesión",
    "2. Vincula tu cuenta dentro de la app (sin código OTP)",
    "",
    "También puedes usar el botón de menú «Abrir Cerbero».",
    "",
    "Cuando estés vinculado podrás usar:",
    "/add · /last · /month · /dashboard",
  ].join("\n");
}

export function formatStartMessage(linked: boolean): string {
  if (linked) {
    return [
      "Bienvenido de nuevo a Cerbero.",
      "",
      "Usa el botón de menú o /add para registrar movimientos.",
      "",
      formatLinkedCommandsHelp(),
    ].join("\n");
  }

  return [
    "Bienvenido a Cerbero — tu tracker de gastos e ingresos.",
    "",
    formatGuestCommandsHelp(),
  ].join("\n");
}

export function formatRequireLinkMessage(): string {
  return ["Primero vincula tu cuenta.", "", formatGuestCommandsHelp()].join(
    "\n",
  );
}

export function formatAlreadyLinkedMessage(): string {
  return [
    "Tu Telegram ya está vinculado.",
    "",
    `Panel: ${getDashboardUrl()}`,
    "",
    "Usa /start para ver todos los comandos.",
  ].join("\n");
}

export function formatLinkSuccessMessage(): string {
  return [
    "✅ Cuenta vinculada correctamente.",
    "",
    `Panel: ${getDashboardUrl()}`,
    "",
    formatLinkedCommandsHelp(),
  ].join("\n");
}

function getDashboardUrl(): string {
  return `${env.DASHBOARD_URL.replace(/\/$/, "")}/dashboard`;
}

export { getDashboardUrl };
