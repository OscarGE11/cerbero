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

export function CategoryColumnFilter({
  categories,
  value,
  onChange,
}: CategoryColumnFilterProps) {
  const toggleCategory = (categoryId: string, checked: boolean) => {
    const categoryIds = checked
      ? [...value.categoryIds, categoryId]
      : value.categoryIds.filter((id) => id !== categoryId);

    onChange({ ...value, categoryIds });
  };

  return (
    <div className="space-y-3">
      <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
        {categories.map((category) => {
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
            Otros
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
