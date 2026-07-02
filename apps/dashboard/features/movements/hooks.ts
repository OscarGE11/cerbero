"use client";

import { getMonthSummary, getMovements } from "@/features/movements/api";
import { useAccessToken } from "@/lib/hooks/use-access-token";
import { useQuery } from "@tanstack/react-query";

export function useMovements(page = 1, pageSize = 8) {
  const { accessToken } = useAccessToken();

  return useQuery({
    queryKey: ["movements", accessToken, page, pageSize],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return getMovements(accessToken, { page, pageSize });
    },
    enabled: !!accessToken,
  });
}

export function useMonthSummary(month?: string) {
  const { accessToken } = useAccessToken();

  return useQuery({
    queryKey: ["month-summary", accessToken, month],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return getMonthSummary(accessToken, month);
    },
    enabled: !!accessToken,
  });
}
