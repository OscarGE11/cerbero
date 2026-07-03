"use client";

import { DataTableHeaderCell } from "@/components/data-table/data-table-header-cell";
import type { DataTableProps } from "@/components/data-table/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

type DataTableComponentProps<T> = DataTableProps<T> & {
  categories?: Category[];
};

export function DataTable<T>({
  columns,
  data,
  loading = false,
  fetching = false,
  error = false,
  pagination,
  filters,
  onFilterChange,
  onSortChange,
  sort,
  emptyMessage = "No hay datos.",
  filteredEmptyMessage = "Ningún resultado coincide con los filtros.",
  hasActiveFilters = false,
  onClearFilters,
  gridClassName,
  getRowKey,
  renderRow,
  categories,
}: DataTableComponentProps<T>) {
  const showEmpty = !loading && !error && data.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {loading && (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando…
        </div>
      )}

      {error && (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-expense">
          No se pudieron cargar los datos.
        </div>
      )}

      {showEmpty && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center text-sm text-muted-foreground">
          <p>{hasActiveFilters ? filteredEmptyMessage : emptyMessage}</p>
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <>
          <div
            className={cn(
              "relative min-h-0 flex-1 overflow-auto rounded-xl border border-white/[0.06]",
              fetching && "opacity-70",
            )}
          >
            {fetching && (
              <div className="absolute right-3 top-3 z-[2]">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            )}

            <div
              className={cn(
                gridClassName,
                "sticky top-0 z-[1] border-b border-white/[0.08] bg-card py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
              )}
            >
              {columns.map((column) => (
                <DataTableHeaderCell
                  key={column.id}
                  column={column}
                  sort={sort}
                  filterValue={filters[column.id]}
                  onFilterChange={onFilterChange}
                  onSortChange={onSortChange}
                  categories={categories}
                />
              ))}
            </div>

            {data.map((row) => (
              <div key={getRowKey(row)}>{renderRow(row)}</div>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex shrink-0 items-center justify-between border-t border-white/[0.06] pt-4">
              <button
                type="button"
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.page - 1))
                }
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.totalPages, pagination.page + 1),
                  )
                }
                disabled={pagination.page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
