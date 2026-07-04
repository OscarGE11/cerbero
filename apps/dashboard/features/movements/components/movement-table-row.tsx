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
        "border-b border-white/[0.05] py-2.5 transition hover:bg-white/[0.02] sm:py-3",
      )}
    >
      <div className="flex justify-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9",
            isIncome
              ? "bg-income/10 text-income"
              : "bg-expense/10 text-expense",
          )}
          title={label}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="min-w-0 text-center">
        <span
          className={cn(
            "whitespace-nowrap text-xs font-semibold tabular-nums sm:text-sm",
            isIncome ? "text-income" : "text-expense",
          )}
        >
          {isIncome ? "+" : "-"}
          {formatCurrency(movement.amount)}
        </span>
      </div>

      <div className="min-w-0 text-center">
        <span className="block truncate text-xs font-medium sm:text-sm">
          {movement.title}
        </span>
      </div>

      {showDate && (
        <div className="hidden min-w-0 text-center sm:block">
          <span className="block truncate text-sm text-muted-foreground">
            {formatDate(movement.date)}
          </span>
        </div>
      )}

      {onDelete ? (
        <div className="flex w-9 justify-self-end sm:w-10">
          <MovementDeleteButton
            loading={deleting}
            movementTitle={movement.title}
            onDelete={() => onDelete(movement.id)}
          />
        </div>
      ) : (
        <span aria-hidden className="block w-9 justify-self-end sm:w-10" />
      )}
    </div>
  );
}
