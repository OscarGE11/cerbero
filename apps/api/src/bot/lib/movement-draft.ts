import { formatCurrency } from "../../lib/format.js";
import type { MovementDraft } from "../types.js";

export function parsePositiveAmount(text: string): number | null {
  const amount = Number.parseFloat(text.replace(",", "."));
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function buildMovementSummary(draft: MovementDraft): string {
  const typeLabel = draft.type === "income" ? "Ingreso" : "Gasto";
  const category =
    draft.customCategory ?? draft.categoryName ?? "Sin categoría";
  return [
    "Confirma el movimiento:",
    `• Tipo: ${typeLabel}`,
    `• Categoría: ${category}`,
    `• Título: ${draft.title}`,
    `• Importe: ${formatCurrency(draft.amount ?? 0)}`,
    `• Comentario: ${draft.comment ?? "—"}`,
  ].join("\n");
}
