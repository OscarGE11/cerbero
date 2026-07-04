"use client";

import { DataTableHeaderCell } from "@/components/data-table/data-table-header-cell";
import type { DataTableProps } from "@/components/data-table/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  filteredEmptyMessage = "No hemos encontrado movimientos con esos filtros.",
  hasActiveFilters = false,
  gridClassName,
  getRowKey,
  renderRow,
  categories,
}: DataTableComponentProps<T>) {
  const isInitialLoad = loading && data.length === 0;
  const showTable = !isInitialLoad && !error;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isInitialLoad && (
        <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Cargando…
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="my-auto">
          <AlertDescription>No se pudieron cargar los datos.</AlertDescription>
        </Alert>
      )}

      {showTable && (
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
                "sticky top-0 z-[1] items-center border-b border-white/[0.08] bg-card py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:py-3",
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

            {data.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                {hasActiveFilters ? filteredEmptyMessage : emptyMessage}
              </div>
            ) : (
              data.map((row) => (
                <div key={getRowKey(row)}>{renderRow(row)}</div>
              ))
            )}
          </div>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex shrink-0 items-center justify-between border-t border-white/[0.06] pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(Math.max(1, pagination.page - 1))
                }
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  pagination.onPageChange(
                    Math.min(pagination.totalPages, pagination.page + 1),
                  )
                }
                disabled={pagination.page >= pagination.totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
