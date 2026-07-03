"use client";

import { useAuth } from "@/components/providers";

/** @deprecated Prefer useAuth() — kept for existing hooks. */
export function useAccessToken() {
  const { accessToken, isLoading } = useAuth();
  return { accessToken, isLoading };
}
