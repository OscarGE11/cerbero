"use client";

import { currentMonthIso } from "@/lib/month";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function parseMonth(
  searchParams: URLSearchParams,
  availableMonths: string[],
): string {
  const current = currentMonthIso();
  const fromUrl = searchParams.get("month");
  if (fromUrl && (availableMonths.includes(fromUrl) || fromUrl === current)) {
    return fromUrl;
  }
  return current;
}

function syncMonthUrl(pathname: string, month: string) {
  const current = currentMonthIso();
  const params = new URLSearchParams(window.location.search);
  if (month === current) params.delete("month");
  else params.set("month", month);
  const query = params.toString();
  const url = query ? `${pathname}?${query}` : pathname;
  window.history.replaceState(window.history.state, "", url);
}

export function useSelectedMonth(availableMonths: string[] = []) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentMonth = currentMonthIso();

  const months = useMemo(() => {
    const unique = new Set([currentMonth, ...availableMonths]);
    return Array.from(unique).sort((a, b) => b.localeCompare(a));
  }, [availableMonths, currentMonth]);

  const [selectedMonth, setSelectedMonthState] = useState(() =>
    parseMonth(searchParams, months),
  );

  useEffect(() => {
    setSelectedMonthState(parseMonth(searchParams, months));
  }, [searchParams, months]);

  useEffect(() => {
    const onPopState = () => {
      setSelectedMonthState(
        parseMonth(new URLSearchParams(window.location.search), months),
      );
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [months]);

  const setSelectedMonth = useCallback(
    (month: string) => {
      setSelectedMonthState(month);
      syncMonthUrl(pathname, month);
    },
    [pathname],
  );

  return { selectedMonth, setSelectedMonth, months, currentMonth };
}
