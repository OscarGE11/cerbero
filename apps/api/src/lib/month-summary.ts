import type { MonthSummary } from "@cerbero/shared";
import type { Movement } from "../types/index.js";

export function getMonthDateRange(month: string): { from: string; to: string } {
  const [year, monthNum] = month.split("-").map(Number);
  const lastDay = new Date(year, monthNum, 0).getDate();
  return {
    from: `${month}-01`,
    to: `${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function computeMonthSummary(
  month: string,
  movements: Movement[],
): MonthSummary {
  const expenses = movements
    .filter((m) => m.type === "expense")
    .reduce((sum, m) => sum + m.amount, 0);
  const income = movements
    .filter((m) => m.type === "income")
    .reduce((sum, m) => sum + m.amount, 0);

  return {
    month,
    expenses,
    income,
    balance: income - expenses,
  };
}
