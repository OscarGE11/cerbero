"use client";

import { CategoryColumnFilter } from "@/components/data-table/filters/category-column-filter";
import { SortControls } from "@/components/data-table/filters/sort-controls";
import { TextColumnFilter } from "@/components/data-table/filters/text-column-filter";
import type {
  DataTableColumn,
  DataTableSort,
} from "@/components/data-table/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CategoryFilterValue } from "@/lib/hooks/use-movement-filters";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import { ChevronDown, Filter } from "lucide-react";

type DataTableHeaderCellProps<T> = {
  column: DataTableColumn<T>;
  sort?: DataTableSort;
  filterValue: unknown;
  onFilterChange: (columnId: string, value: unknown) => void;
  onSortChange: (columnId: string, order: "asc" | "desc" | null) => void;
  categories?: Category[];
};

function isFilterActive(
  columnId: string,
  filterType: DataTableColumn<unknown>["filterType"],
  filterValue: unknown,
): boolean {
  if (filterType === "text") {
    return Boolean(filterValue);
  }
  if (filterType === "category") {
    const value = filterValue as CategoryFilterValue | undefined;
    if (!value) return false;
    return (
      value.categoryIds.length > 0 ||
      value.includeCustom ||
      value.customCategory !== ""
    );
  }
  return false;
}

export function DataTableHeaderCell<T>({
  column,
  sort,
  filterValue,
  onFilterChange,
  onSortChange,
  categories = [],
}: DataTableHeaderCellProps<T>) {
  const isSorted = sort?.columnId === column.id;
  const hasFilter = isFilterActive(column.id, column.filterType, filterValue);
  const hasControls =
    column.sortable || (column.filterType && column.filterType !== "none");

  const hiddenClass =
    column.hidden === "md"
      ? "hidden md:inline-flex"
      : column.hidden === "sm"
        ? "hidden sm:inline-flex"
        : undefined;

  if (!hasControls) {
    return (
      <span className={cn(column.className, hiddenClass)}>{column.header}</span>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 text-left transition hover:text-foreground",
            column.className,
            hiddenClass,
            (hasFilter || isSorted) && "text-primary",
          )}
        >
          <span>{column.header}</span>
          {hasFilter ? (
            <Filter className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-3 p-3">
        {column.sortable && column.sortType && (
          <SortControls
            sortType={column.sortType}
            currentOrder={isSorted ? sort?.order : undefined}
            onSortChange={(order) => onSortChange(column.id, order)}
          />
        )}

        {column.filterType === "text" && (
          <TextColumnFilter
            value={String(filterValue ?? "")}
            placeholder={`Buscar ${column.header.toLowerCase()}…`}
            onChange={(value) => onFilterChange(column.id, value)}
          />
        )}

        {column.filterType === "category" && (
          <CategoryColumnFilter
            categories={categories}
            value={
              (filterValue as CategoryFilterValue | undefined) ?? {
                categoryIds: [],
                includeCustom: false,
                customCategory: "",
              }
            }
            onChange={(value) => onFilterChange(column.id, value)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
