"use client";

import { useCategories } from "@/features/categories/hooks";
import { MovementsTable } from "@/features/movements/components/movements-table";

export function MovementsPageContent() {
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <MovementsTable categories={categories} />
    </div>
  );
}
