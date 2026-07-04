"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMonthLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MonthSelector({
  months,
  value,
  onChange,
  loading = false,
  className,
}: {
  months: string[];
  value: string;
  onChange: (month: string) => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Label htmlFor="dashboard-month" className="text-muted-foreground">
        Mes
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading || months.length === 0}
      >
        <SelectTrigger id="dashboard-month" className="min-w-[10rem]">
          <SelectValue placeholder="Seleccionar mes" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {formatMonthLabel(month)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
