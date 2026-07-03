"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type TextColumnFilterProps = {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
};

export function TextColumnFilter({
  value,
  placeholder = "Buscar…",
  onChange,
}: TextColumnFilterProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-8 pl-8 text-xs"
      />
    </div>
  );
}
