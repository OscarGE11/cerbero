"use client";

import { useCategories } from "@/features/categories/hooks";
import { MovementsTable } from "@/features/movements/components/movements-table";
import Link from "next/link";

export function MovementsPageContent() {
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Volver al dashboard
        </Link>
      </div>

      <MovementsTable categories={categories} />
    </div>
  );
}
