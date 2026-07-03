"use client";

import type { ComponentProps } from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = ComponentProps<typeof Sonner>;

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-white/[0.08] group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-card",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toast]:border-income/30 group-[.toast]:text-foreground",
          error:
            "group-[.toast]:border-expense/30 group-[.toast]:text-foreground",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
