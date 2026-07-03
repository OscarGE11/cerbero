import { env } from "../../config/env.js";

function getDashboardUrl(): string {
  return `${env.DASHBOARD_URL.replace(/\/$/, "")}/dashboard`;
}

/** Comandos disponibles con cuenta vinculada. */
export function formatLinkedCommandsHelp(): string {
  return [
    "Registros",
    "/add — Añadir gasto o ingreso",
    "/last — Últimos 5 movimientos",
    "/month — Resumen del mes actual",
    "",
    "Panel web",
    `/dashboard — Abrir ${getDashboardUrl()}`,
    "",
    "Cuenta",
    "/unlink — Desvincular este Telegram",
    "/cancel — Cancelar un /add en curso",
  ].join("\n");
}

/** Onboarding para usuarios sin vincular. */
export function formatGuestCommandsHelp(): string {
  return [
    "Primeros pasos",
    "1. /login — Enlace web para registrarte o iniciar sesión",
    "2. Copia el código OTP de 6 dígitos",
    "3. /link CÓDIGO — Vincula este Telegram",
    "",
    "Cuando estés vinculado podrás usar:",
    "/add · /last · /month · /dashboard",
  ].join("\n");
}

export function formatStartMessage(linked: boolean): string {
  if (linked) {
    return ["Bienvenido de nuevo a Cerbero.", "", formatLinkedCommandsHelp()].join(
      "\n",
    );
  }

  return [
    "Bienvenido a Cerbero — tu tracker de gastos e ingresos.",
    "",
    formatGuestCommandsHelp(),
  ].join("\n");
}

export function formatRequireLinkMessage(): string {
  return [
    "Primero vincula tu cuenta.",
    "",
    formatGuestCommandsHelp(),
  ].join("\n");
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

export { getDashboardUrl };
