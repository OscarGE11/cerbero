"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryFilterValue } from "@/lib/hooks/use-movement-filters";
import type { Category } from "@cerbero/shared";

type CategoryColumnFilterProps = {
  categories: Category[];
  value: CategoryFilterValue;
  onChange: (value: CategoryFilterValue) => void;
};

const TYPE_LABELS = {
  expense: "Gastos",
  income: "Ingresos",
} as const;

function groupCategories(categories: Category[]) {
  const expense = categories.filter((c) => c.type === "expense");
  const income = categories.filter((c) => c.type === "income");
  return { expense, income };
}

export function CategoryColumnFilter({
  categories,
  value,
  onChange,
}: CategoryColumnFilterProps) {
  const { expense, income } = groupCategories(categories);

  const toggleCategory = (categoryId: string, checked: boolean) => {
    const categoryIds = checked
      ? [...value.categoryIds, categoryId]
      : value.categoryIds.filter((id) => id !== categoryId);

    onChange({ ...value, categoryIds });
  };

  const renderGroup = (label: string, items: Category[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {items.map((category) => {
          const checked = value.categoryIds.includes(category.id);
          return (
            <div key={category.id} className="flex items-center gap-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={checked}
                onCheckedChange={(next) =>
                  toggleCategory(category.id, next === true)
                }
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="cursor-pointer text-xs font-normal"
              >
                {category.name}
              </Label>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="max-h-48 space-y-3 overflow-y-auto pr-1">
        {renderGroup(TYPE_LABELS.expense, expense)}
        {renderGroup(TYPE_LABELS.income, income)}
      </div>

      <div className="border-t border-white/[0.08] pt-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="category-custom"
            checked={value.includeCustom}
            onCheckedChange={(next) =>
              onChange({
                ...value,
                includeCustom: next === true,
              })
            }
          />
          <Label
            htmlFor="category-custom"
            className="cursor-pointer text-xs font-normal"
          >
            Personalizadas
          </Label>
        </div>

        {value.includeCustom && (
          <Input
            value={value.customCategory}
            onChange={(event) =>
              onChange({ ...value, customCategory: event.target.value })
            }
            placeholder="Buscar en categoría personalizada…"
            className="mt-2 h-8 text-xs"
          />
        )}
      </div>
    </div>
  );
}
