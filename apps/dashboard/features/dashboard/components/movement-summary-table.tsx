"use client";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import { movementRowGridClass } from "@/features/dashboard/constants";
import { MovementTableRow } from "@/features/movements/components/movement-table-row";
import { useDeleteMovement, useMovements } from "@/features/movements/hooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import Link from "next/link";

const SUMMARY_PAGE_SIZE = 50;

export function MovementSummaryTable({
  categories,
}: { categories: Category[] }) {
  const { data, isLoading, isError } = useMovements({
    page: 1,
    pageSize: SUMMARY_PAGE_SIZE,
    sortBy: "date",
    sortOrder: "desc",
  });
  const { deleteMovement, deletingId } = useDeleteMovement();

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <DashboardCard
      fullHeight
      title="Transacciones"
      description={
        total > 0
          ? `${total} movimiento${total === 1 ? "" : "s"} en total`
          : "Historial completo por fecha"
      }
      action={
        <Button variant="link" asChild className="h-auto p-0 text-sm">
          <Link href="/dashboard/movements">Ver todo</Link>
        </Button>
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
          <Alert variant="destructive" className="my-auto">
            <AlertDescription>
              No se pudieron cargar las transacciones.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <Alert className="my-auto border-white/[0.08] bg-white/[0.03]">
            <AlertDescription className="text-center text-muted-foreground">
              Aún no tienes movimientos.
              <br />
              Usa <code className="text-primary">/add</code> en Telegram.
            </AlertDescription>
          </Alert>
        )}

        {!isLoading && !isError && items.length > 0 && (
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
              <span className="hidden sm:block">Fecha</span>
              <span aria-hidden className="block w-10 justify-self-end" />
            </div>

            {items.map((movement) => (
              <MovementTableRow
                key={movement.id}
                movement={movement}
                categories={categories}
                onDelete={deleteMovement}
                deleting={deletingId === movement.id}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
