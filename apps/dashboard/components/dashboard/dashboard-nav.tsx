"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const navLinks = [
  { href: "/dashboard", label: "Inicio", exact: true },
  { href: "/dashboard/movements", label: "Movimientos", exact: false },
] as const;

export function isNavLinkActive(
  pathname: string,
  link: { href: string; exact: boolean },
): boolean {
  return link.exact ? pathname === link.href : pathname.startsWith(link.href);
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {navLinks.map((link) => {
        const active = isNavLinkActive(pathname, link);

        return (
          <Button
            key={link.href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              active
                ? "bg-white/[0.08] font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Link href={link.href} prefetch>
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
