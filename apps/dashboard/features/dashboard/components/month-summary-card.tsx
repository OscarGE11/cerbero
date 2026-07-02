import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MonthSummary } from "@cerbero/shared";

export function MonthSummaryCard({
  summary,
  loading,
}: {
  summary?: MonthSummary;
  loading: boolean;
}) {
  return (
    <DashboardCard title="Resumen del mes">
      {loading || !summary ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-white/[0.03]"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          <SummaryRow
            label="Ingresos"
            value={summary.income}
            tone="income"
            prefix="+"
          />
          <SummaryRow
            label="Gastos"
            value={summary.expenses}
            tone="expense"
            prefix="-"
          />
          <SummaryRow
            label="Balance"
            value={summary.balance}
            tone={summary.balance >= 0 ? "income" : "expense"}
            prefix={summary.balance > 0 ? "+" : ""}
            highlight
          />
        </div>
      )}
    </DashboardCard>
  );
}

function SummaryRow({
  label,
  value,
  tone,
  prefix,
  highlight = false,
}: {
  label: string;
  value: number;
  tone: "income" | "expense";
  prefix?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-4 py-3",
        highlight ? "bg-white/[0.05]" : "bg-white/[0.03]",
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          tone === "income" ? "text-income" : "text-expense",
        )}
      >
        {prefix}
        {formatCurrency(value)}
      </span>
    </div>
  );
}
