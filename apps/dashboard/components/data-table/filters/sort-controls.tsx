"use client";

import type { SortType } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

type SortControlsProps = {
  sortType: SortType;
  currentOrder?: "asc" | "desc";
  onSortChange: (order: "asc" | "desc" | null) => void;
  label?: string;
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
  label = "Ordenar",
}: SortControlsProps) {
  const labels = SORT_LABELS[sortType];

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(currentOrder === "asc" ? null : "asc")}
          className={cn(
            "h-8 flex-1 text-xs",
            currentOrder === "asc" &&
              "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          <ArrowUp className="h-3 w-3" />
          {labels.asc}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(currentOrder === "desc" ? null : "desc")}
          className={cn(
            "h-8 flex-1 text-xs",
            currentOrder === "desc" &&
              "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary",
          )}
        >
          <ArrowDown className="h-3 w-3" />
          {labels.desc}
        </Button>
      </div>
    </div>
  );
}
