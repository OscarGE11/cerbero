"use client";

import type { SortType } from "@/components/data-table/types";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

type SortControlsProps = {
  sortType: SortType;
  currentOrder?: "asc" | "desc";
  onSortChange: (order: "asc" | "desc" | null) => void;
};

const SORT_LABELS: Record<SortType, { asc: string; desc: string }> = {
  alpha: { asc: "A-Z", desc: "Z-A" },
  numeric: { asc: "Menor", desc: "Mayor" },
  date: { asc: "Antiguo", desc: "Reciente" },
};

export function SortControls({
  sortType,
  currentOrder,
  onSortChange,
}: SortControlsProps) {
  const labels = SORT_LABELS[sortType];

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">Ordenar</p>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onSortChange(currentOrder === "asc" ? null : "asc")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition",
            currentOrder === "asc"
              ? "bg-primary/15 text-primary"
              : "hover:bg-white/[0.06]",
          )}
        >
          <ArrowUp className="h-3 w-3" />
          {labels.asc}
        </button>
        <button
          type="button"
          onClick={() => onSortChange(currentOrder === "desc" ? null : "desc")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs transition",
            currentOrder === "desc"
              ? "bg-primary/15 text-primary"
              : "hover:bg-white/[0.06]",
          )}
        >
          <ArrowDown className="h-3 w-3" />
          {labels.desc}
        </button>
      </div>
    </div>
  );
}
