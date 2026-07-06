import type { MovementType } from "@cerbero/shared";

export function parsePositiveAmount(text: string): number | null {
  const amount = Number.parseFloat(text.replace(",", "."));
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidIsoDate(year: string, month: string, day: string): boolean {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const date = new Date(y, m - 1, d);
  return (
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

export function parseMovementDate(text: string): string | null {
  const trimmed = text.trim();

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return isValidIsoDate(year, month, day) ? trimmed : null;
  }

  const dmyMatch = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(trimmed);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    return isValidIsoDate(year, month, day) ? iso : null;
  }

  return null;
}

export function shiftIsoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMovementType(type: MovementType): string {
  return type === "income" ? "Ingreso" : "Gasto";
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatDisplayDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}
