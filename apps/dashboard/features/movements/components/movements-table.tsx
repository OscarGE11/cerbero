"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { DataTable } from "@/components/data-table/data-table";
import type { DataTableColumn } from "@/components/data-table/types";
import { movementRowGridClass } from "@/features/dashboard/constants";
import { MovementTableRow } from "@/features/movements/components/movement-table-row";
import { useMovements } from "@/features/movements/hooks";
import { useMovementFilters } from "@/lib/hooks/use-movement-filters";
import type { Category, Movement } from "@cerbero/shared";

function buildMovementColumns(): DataTableColumn<Movement>[] {
  return [
    {
      id: "category",
      header: "Categoría",
      sortable: true,
      sortType: "alpha",
      filterType: "category",
      className: "justify-self-center",
      cell: () => null,
    },
    {
      id: "amount",
      header: "Cantidad",
      sortable: true,
      sortType: "numeric",
      filterType: "number",
      cell: () => null,
    },
    {
      id: "title",
      header: "Título",
      sortable: true,
      sortType: "alpha",
      filterType: "text",
      cell: () => null,
    },
    {
      id: "comment",
      header: "Descripción",
      sortable: true,
      sortType: "alpha",
      filterType: "text",
      hidden: "md",
      cell: () => null,
    },
    {
      id: "createdAt",
      header: "Fecha",
      sortable: true,
      sortType: "date",
      filterType: "none",
      hidden: "sm",
      cell: () => null,
    },
  ];
}

export function MovementsTable({ categories }: { categories: Category[] }) {
  const {
    queryParams,
    filters,
    sort,
    hasActiveFilters,
    setFilter,
    setSort,
    setPage,
    inputs,
  } = useMovementFilters();

  const { data, isLoading, isFetching, isError } = useMovements(queryParams);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;
  const columns = buildMovementColumns();

  return (
    <DashboardCard
      fullHeight
      title="Movimientos"
      description={
        total > 0
          ? `${total} movimiento${total === 1 ? "" : "s"}`
          : "Historial completo de movimientos"
      }
      className="min-h-[560px]"
    >
      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        fetching={isFetching && !isLoading}
        error={isError}
        pagination={{
          page: inputs.page,
          totalPages,
          onPageChange: setPage,
        }}
        filters={filters}
        onFilterChange={setFilter}
        onSortChange={setSort}
        sort={sort}
        hasActiveFilters={hasActiveFilters}
        categories={categories}
        gridClassName={movementRowGridClass}
        getRowKey={(movement) => movement.id}
        renderRow={(movement) => (
          <MovementTableRow movement={movement} categories={categories} />
        )}
        emptyMessage={
          <>
            Aún no tienes movimientos.
            <br />
            Usa <code className="text-primary">/add</code> en Telegram.
          </>
        }
        filteredEmptyMessage="No hemos encontrado movimientos con esos filtros."
      />
    </DashboardCard>
  );
}
