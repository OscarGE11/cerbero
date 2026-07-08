"use client";

import { CategoryColumnFilter } from "@/components/data-table/filters/category-column-filter";
import { SortControls } from "@/components/data-table/filters/sort-controls";
import { TextColumnFilter } from "@/components/data-table/filters/text-column-filter";
import type {
  DataTableColumn,
  DataTableSort,
} from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CategoryFilterValue } from "@/lib/hooks/use-movement-filters";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import { ArrowDownUp, SlidersHorizontal } from "lucide-react";

type DataTableToolbarProps<T> = {
  columns: DataTableColumn<T>[];
  sort?: DataTableSort;
  filters: Record<string, unknown>;
  onSortChange: (columnId: string, order: "asc" | "desc" | null) => void;
  onFilterChange: (columnId: string, value: unknown) => void;
  categories?: Category[];
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
  className?: string;
};

/**
 * Compact "Ordenar / Filtrar" bar for small screens, where per-column
 * headers don't fit. Column headers are hidden on mobile and their sort
 * and filter controls are grouped into two popover menus here.
 */
export function DataTableToolbar<T>({
  columns,
  sort,
  filters,
  onSortChange,
  onFilterChange,
  categories = [],
  hasActiveFilters = false,
  onClearFilters,
  className,
}: DataTableToolbarProps<T>) {
  const sortableColumns = columns.filter(
    (column) => column.sortable && column.sortType,
  );
  const filterableColumns = columns.filter(
    (column) =>
      column.filterType === "text" || column.filterType === "category",
  );

  const activeSortColumn = sort
    ? columns.find((column) => column.id === sort.columnId)
    : undefined;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {sortableColumns.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 flex-1 justify-center gap-2 text-xs",
                sort && "border-primary/40 text-primary",
              )}
            >
              <ArrowDownUp className="h-3.5 w-3.5" />
              {activeSortColumn
                ? `Orden: ${activeSortColumn.header}`
                : "Ordenar"}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[calc(100vw-2rem)] max-w-xs space-y-3 p-3"
          >
            {sortableColumns.map((column) => {
              if (!column.sortType) return null;
              return (
                <SortControls
                  key={column.id}
                  label={column.header}
                  sortType={column.sortType}
                  currentOrder={
                    sort?.columnId === column.id ? sort.order : undefined
                  }
                  onSortChange={(order) => onSortChange(column.id, order)}
                />
              );
            })}
          </PopoverContent>
        </Popover>
      )}

      {filterableColumns.length > 0 && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                "h-9 flex-1 justify-center gap-2 text-xs",
                hasActiveFilters && "border-primary/40 text-primary",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtrar
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[calc(100vw-2rem)] max-w-xs space-y-4 p-3"
          >
            {filterableColumns.map((column) => (
              <div key={column.id} className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">
                  {column.header}
                </p>
                {column.filterType === "text" && (
                  <TextColumnFilter
                    value={String(filters[column.id] ?? "")}
                    placeholder={`Buscar ${column.header.toLowerCase()}…`}
                    onChange={(value) => onFilterChange(column.id, value)}
                  />
                )}
                {column.filterType === "category" && (
                  <CategoryColumnFilter
                    categories={categories}
                    value={
                      (filters[column.id] as
                        | CategoryFilterValue
                        | undefined) ?? {
                        categoryIds: [],
                        includeCustom: false,
                        customCategory: "",
                      }
                    }
                    onChange={(value) => onFilterChange(column.id, value)}
                  />
                )}
              </div>
            ))}

            {hasActiveFilters && onClearFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={onClearFilters}
              >
                Limpiar filtros
              </Button>
            )}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
