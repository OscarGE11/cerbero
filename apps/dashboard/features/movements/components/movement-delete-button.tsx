"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

export function MovementDeleteButton({
  onDelete,
  loading = false,
}: {
  onDelete: () => void;
  loading?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-muted-foreground hover:text-destructive"
      disabled={loading}
      aria-label="Eliminar movimiento"
      onClick={() => {
        if (window.confirm("¿Eliminar este movimiento?")) {
          onDelete();
        }
      }}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
