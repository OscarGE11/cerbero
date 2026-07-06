"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getTelegramMovements,
  getTelegramSummary,
} from "@/features/telegram/api";
import { useTelegramMe } from "@/features/telegram/hooks";
import { formatCurrency } from "@/features/telegram/lib/movement-form";
import { useTelegram } from "@/lib/telegram/provider";
import { TelegramShell } from "@/lib/telegram/shell";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function TelegramHomePage() {
  const { initData } = useTelegram();
  const { data: me } = useTelegramMe();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["telegram", "summary", initData],
    queryFn: () => getTelegramSummary(initData),
    enabled: Boolean(initData) && Boolean(me?.linked),
  });

  const { data: movements, isLoading: movementsLoading } = useQuery({
    queryKey: ["telegram", "movements", initData],
    queryFn: () => getTelegramMovements(initData, 5),
    enabled: Boolean(initData) && Boolean(me?.linked),
  });

  return (
    <TelegramShell title="Cerbero">
      <div className="space-y-4">
        <Card className="glass-card border-white/[0.08]">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">Resumen del mes</p>
            {summaryLoading || !summary ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : (
              <div className="space-y-1 text-sm">
                <p>
                  Gastos:{" "}
                  <span className="text-expense">
                    {formatCurrency(summary.expenses)}
                  </span>
                </p>
                <p>
                  Ingresos:{" "}
                  <span className="text-income">
                    {formatCurrency(summary.income)}
                  </span>
                </p>
                <p className="font-medium">
                  Balance: {formatCurrency(summary.balance)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-white/[0.08]">
          <CardContent className="space-y-3 p-4">
            <p className="text-sm text-muted-foreground">Últimos movimientos</p>
            {movementsLoading ? (
              <p className="text-sm text-muted-foreground">Cargando…</p>
            ) : movements?.items.length ? (
              <ul className="space-y-2 text-sm">
                {movements.items.map((movement) => (
                  <li
                    key={movement.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="truncate">{movement.title}</span>
                    <span
                      className={
                        movement.type === "income"
                          ? "text-income"
                          : "text-expense"
                      }
                    >
                      {movement.type === "income" ? "+" : "-"}
                      {formatCurrency(movement.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Aún no tienes movimientos.
              </p>
            )}
          </CardContent>
        </Card>

        <Button asChild className="h-11 w-full rounded-xl">
          <Link href="/telegram/add">Añadir movimiento</Link>
        </Button>
      </div>
    </TelegramShell>
  );
}
