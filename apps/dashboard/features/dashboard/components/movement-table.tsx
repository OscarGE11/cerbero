"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { MovementTableRow } from "@/features/dashboard/components/movement-table-row";
import { movementRowGridClass } from "@/features/dashboard/constants";
import { useMovements } from "@/features/movements/hooks";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function MovementTable({ categories }: { categories: Category[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, isError } = useMovements(page, pageSize);

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <DashboardCard
      fullHeight
      title="Lista de transacciones"
      description={
        total > 0
          ? `${total} movimiento${total === 1 ? "" : "s"}`
          : "Historial de movimientos"
      }
      className="w-full min-h-[480px] md:min-h-0"
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {isLoading && (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
            Cargando transacciones…
          </div>
        )}

        {isError && (
          <div className="flex flex-1 items-center justify-center py-12 text-sm text-expense">
            No se pudieron cargar las transacciones.
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-12 text-center text-sm text-muted-foreground">
            Aún no tienes movimientos.
            <br />
            Usa <code className="text-primary">/add</code> en Telegram.
          </div>
        )}

        {!isLoading && !isError && items.length > 0 && (
          <>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-white/[0.06]">
              <div
                className={cn(
                  movementRowGridClass,
                  "sticky top-0 z-[1] border-b border-white/[0.08] bg-card py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground",
                )}
              >
                <span className="justify-self-center">Categoría</span>
                <span>Cantidad</span>
                <span>Título</span>
                <span className="hidden md:block">Descripción</span>
              </div>

              {items.map((movement) => (
                <MovementTableRow
                  key={movement.id}
                  movement={movement}
                  categories={categories}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex shrink-0 items-center justify-between border-t border-white/[0.06] pt-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </button>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
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
    </DashboardCard>
  );
}
