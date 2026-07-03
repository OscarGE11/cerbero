"use client";

import { getMonthSummary, getMovements } from "@/features/movements/api";
import { useAccessToken } from "@/lib/hooks/use-access-token";
import type { MovementQueryParams } from "@cerbero/shared";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useMovements(params: MovementQueryParams = {}) {
  const { accessToken } = useAccessToken();
  const { page = 1, pageSize = 10, ...filters } = params;

  return useQuery({
    queryKey: ["movements", accessToken, { page, pageSize, ...filters }],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return getMovements(accessToken, { page, pageSize, ...filters });
    },
    enabled: !!accessToken,
    placeholderData: keepPreviousData,
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
