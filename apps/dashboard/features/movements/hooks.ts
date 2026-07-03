"use client";

import {
  deleteMovement,
  getMonthSummary,
  getMovements,
} from "@/features/movements/api";
import { ApiError } from "@/lib/api/client";
import { useAccessToken } from "@/lib/hooks/use-access-token";
import type { MovementQueryParams } from "@cerbero/shared";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

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

export function useDeleteMovement() {
  const { accessToken } = useAccessToken();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error("No access token");
      setDeletingId(id);
      await deleteMovement(accessToken, id);
    },
    onSettled: () => {
      setDeletingId(null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movements"] });
      queryClient.invalidateQueries({ queryKey: ["month-summary"] });
      toast.success("Movimiento eliminado");
    },
    onError: (error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo eliminar el movimiento";
      toast.error(message);
    },
  });

  return {
    deleteMovement: mutation.mutate,
    deletingId,
    isDeleting: mutation.isPending,
  };
}
