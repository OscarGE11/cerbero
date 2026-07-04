"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MonthSummary } from "@cerbero/shared";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const INCOME_COLOR = "#00d395";
const EXPENSE_COLOR = "#ff5a7a";
const CHART_HEIGHT = 220;

export function BalanceMonthCard({
  summary,
  loading,
}: {
  summary?: MonthSummary;
  loading: boolean;
}) {
  const monthLabel = summary
    ? formatMonthLabel(summary.month)
    : formatMonthLabel(
        `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
      );

  const chartData = summary
    ? [
        { name: "Ingresos", value: summary.income, color: INCOME_COLOR },
        { name: "Gastos", value: summary.expenses, color: EXPENSE_COLOR },
      ].filter((item) => item.value > 0)
    : [];

  const isEmpty = !summary || (summary.income === 0 && summary.expenses === 0);
  const balance = summary?.balance ?? 0;
  const isPositive = balance >= 0;

  return (
    <DashboardCard title="Balance del mes" description={monthLabel}>
      {loading ? (
        <Skeleton
          className="w-full rounded-xl"
          style={{ height: CHART_HEIGHT }}
        />
      ) : isEmpty ? (
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height: CHART_HEIGHT }}
        >
          Sin movimientos este mes
        </div>
      ) : (
        <>
          <div className="relative w-full" style={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: "#121826",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#f4f6fb",
                    fontSize: "13px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">Balance</span>
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  isPositive ? "text-income" : "text-expense",
                )}
              >
                {isPositive && balance > 0 ? "+" : ""}
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          <Separator className="mt-4 bg-white/[0.06]" />
          <div className="mt-4 flex items-center justify-around">
            <Legend
              label="Ingresos"
              value={summary?.income ?? 0}
              color={INCOME_COLOR}
            />
            <Legend
              label="Gastos"
              value={summary?.expenses ?? 0}
              color={EXPENSE_COLOR}
            />
          </div>
        </>
      )}
    </DashboardCard>
  );
}

function Legend({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className="h-3 w-3 shrink-0 rounded-full border-0 p-0"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums" style={{ color }}>
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}
