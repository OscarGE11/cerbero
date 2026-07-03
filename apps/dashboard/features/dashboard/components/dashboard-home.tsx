"use client";

import { useCategories } from "@/features/categories/hooks";
import { BalanceMonthCard } from "@/features/dashboard/components/balance-month-card";
import { MonthSummaryCard } from "@/features/dashboard/components/month-summary-card";
import { MovementSummaryTable } from "@/features/dashboard/components/movement-summary-table";
import { useMonthSummary } from "@/features/movements/hooks";

export function DashboardHome() {
  const { data: summary, isLoading: summaryLoading } = useMonthSummary();
  const { data: categories = [] } = useCategories();

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-5 md:gap-5">
      <div className="flex flex-col gap-4 md:col-span-2">
        <BalanceMonthCard summary={summary} loading={summaryLoading} />
        <MonthSummaryCard summary={summary} loading={summaryLoading} />
      </div>

      <div className="flex min-w-0 md:col-span-3">
        <MovementSummaryTable categories={categories} />
      </div>
    </div>
  );
}
