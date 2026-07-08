"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isNavLinkActive, navLinks } from "./dashboard-nav";

export function MobileNav({ userEmail }: { userEmail?: string | null }) {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {userEmail && (
          <>
            <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
              {userEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {navLinks.map((link) => {
          const active = isNavLinkActive(pathname, link);

          return (
            <DropdownMenuItem key={link.href} asChild>
              <Link
                href={link.href}
                prefetch
                className={cn(
                  "cursor-pointer",
                  active && "bg-white/[0.08] font-medium text-foreground",
                )}
              >
                {link.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <form action="/auth/signout" method="post" className="w-full">
          <button
            type="submit"
            className="flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Salir
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
