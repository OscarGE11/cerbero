"use client";

import { AuthProvider } from "@/components/providers/auth-provider";
import { makeQueryClient } from "@/lib/query-client";
import type { Session } from "@supabase/supabase-js";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export { useAuth } from "@/components/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export function DashboardProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  return (
    <AuthProvider initialSession={initialSession}>{children}</AuthProvider>
  );
}
