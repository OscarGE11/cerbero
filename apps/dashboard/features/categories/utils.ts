import { CATEGORY_ICONS, FALLBACK_ICON } from "@/features/categories/constants";
import type { Category } from "@cerbero/shared";
import type { Movement } from "@cerbero/shared";

export function getCategoryLabel(
  movement: Movement,
  categories: Category[],
): string {
  if (movement.customCategory) return movement.customCategory;
  const category = categories.find((c) => c.id === movement.categoryId);
  return category?.name ?? "Sin categoría";
}

export function getCategoryIcon(movement: Movement, categories: Category[]) {
  if (movement.customCategory) return FALLBACK_ICON;

  const category = categories.find((c) => c.id === movement.categoryId);
  const name = category?.name ?? "Otro";
  return CATEGORY_ICONS[name] ?? FALLBACK_ICON;
}
