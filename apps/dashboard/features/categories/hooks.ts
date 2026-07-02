"use client";

import { getCategories } from "@/features/movements/api";
import { useAccessToken } from "@/lib/hooks/use-access-token";
import { useQuery } from "@tanstack/react-query";

export function useCategories() {
  const { accessToken } = useAccessToken();

  return useQuery({
    queryKey: ["categories", accessToken],
    queryFn: () => {
      if (!accessToken) throw new Error("No access token");
      return getCategories(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
  });
}
