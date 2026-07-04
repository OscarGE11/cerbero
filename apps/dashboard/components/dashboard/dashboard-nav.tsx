"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Inicio", exact: true },
  { href: "/dashboard/movements", label: "Movimientos", exact: false },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);

        return (
          <Button
            key={href}
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              active
                ? "bg-white/[0.08] font-medium text-foreground"
                : "text-muted-foreground",
            )}
          >
            <Link href={href} prefetch>
              {label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
