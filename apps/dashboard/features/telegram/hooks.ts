"use client";

import { getTelegramMe } from "@/features/telegram/api";
import { useTelegram } from "@/lib/telegram/provider";
import { useQuery } from "@tanstack/react-query";

export function useTelegramMe() {
  const { initData, isTelegram } = useTelegram();

  return useQuery({
    queryKey: ["telegram", "me", initData],
    queryFn: () => getTelegramMe(initData),
    enabled: isTelegram && Boolean(initData),
    staleTime: 30_000,
  });
}
