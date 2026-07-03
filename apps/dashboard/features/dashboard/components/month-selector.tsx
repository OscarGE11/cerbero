"use client";

import { formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MonthSelector({
  months,
  value,
  onChange,
  loading = false,
  className,
}: {
  months: string[];
  value: string;
  onChange: (month: string) => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <label
        htmlFor="dashboard-month"
        className="text-sm font-medium text-muted-foreground"
      >
        Mes
      </label>
      <select
        id="dashboard-month"
        value={value}
        disabled={loading || months.length === 0}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-10 min-w-[10rem] rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-foreground shadow-sm",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        {months.map((month) => (
          <option key={month} value={month} className="bg-card text-foreground">
            {formatMonthLabel(month)}
          </option>
        ))}
      </select>
    </div>
  );
}
