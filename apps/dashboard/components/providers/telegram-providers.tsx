"use client";

import { makeQueryClient } from "@/lib/query-client";
import { TelegramProvider } from "@/lib/telegram/provider";
import { TelegramEnvironmentGuard } from "@/lib/telegram/shell";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function TelegramProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <TelegramProvider>
        <TelegramEnvironmentGuard>{children}</TelegramEnvironmentGuard>
      </TelegramProvider>
    </QueryClientProvider>
  );
}
