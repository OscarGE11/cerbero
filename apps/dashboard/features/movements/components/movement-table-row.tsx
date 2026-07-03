import { getCategoryIcon, getCategoryLabel } from "@/features/categories/utils";
import { movementRowGridClass } from "@/features/dashboard/constants";
import { MovementDeleteButton } from "@/features/movements/components/movement-delete-button";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Category } from "@cerbero/shared";
import type { Movement } from "@cerbero/shared";

export function MovementTableRow({
  movement,
  categories,
  showDate = true,
  onDelete,
  deleting = false,
}: {
  movement: Movement;
  categories: Category[];
  showDate?: boolean;
  onDelete?: (movementId: string) => void;
  deleting?: boolean;
}) {
  const Icon = getCategoryIcon(movement, categories);
  const label = getCategoryLabel(movement, categories);
  const isIncome = movement.type === "income";

  return (
    <div
      className={cn(
        movementRowGridClass,
        "items-center border-b border-white/[0.05] py-3 transition hover:bg-white/[0.02]",
      )}
    >
      <div className="flex justify-center">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isIncome
              ? "bg-income/10 text-income"
              : "bg-expense/10 text-expense",
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="min-w-0 text-left">
        <span
          className={cn(
            "text-sm font-semibold tabular-nums",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(movement.amount)}
        </span>
      </div>

      <div className="min-w-0">
        <span className="block truncate text-sm font-medium">
          {movement.title}
        </span>
      </div>

      {showDate && (
        <div className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm text-muted-foreground">
            {formatDate(movement.date)}
          </span>
        </div>
      )}

      {onDelete ? (
        <div className="flex w-10 justify-self-end">
          <MovementDeleteButton
            loading={deleting}
            movementTitle={movement.title}
            onDelete={() => onDelete(movement.id)}
          />
        </div>
      ) : (
        <span aria-hidden className="block w-10 justify-self-end" />
      )}
    </div>
  );
}
