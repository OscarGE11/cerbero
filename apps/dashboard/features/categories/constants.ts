import {
  Car,
  CreditCard,
  Gamepad2,
  HeartPulse,
  Home,
  type LucideIcon,
  MoreHorizontal,
  Shirt,
  Tag,
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
  Otro: MoreHorizontal,
};

export const FALLBACK_ICON = Tag;
