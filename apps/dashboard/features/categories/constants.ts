import {
  Banknote,
  Briefcase,
  Car,
  CreditCard,
  Gamepad2,
  HeartPulse,
  Home,
  type LucideIcon,
  MoreHorizontal,
  RotateCcw,
  Shirt,
  ShoppingBag,
  Tag,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Alimentación: UtensilsCrossed,
  Transporte: Car,
  Ocio: Gamepad2,
  Salud: HeartPulse,
  Hogar: Home,
  Ropa: Shirt,
  Suscripciones: CreditCard,
  Salario: Banknote,
  Freelance: Briefcase,
  Inversiones: TrendingUp,
  Venta: ShoppingBag,
  Reembolso: RotateCcw,
  Otro: MoreHorizontal,
};

export const FALLBACK_ICON = Tag;
