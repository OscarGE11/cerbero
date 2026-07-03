import type { Context } from "hono";
import { ZodError } from "zod";

export function handleControllerError(
  c: Context,
  error: unknown,
  logLabel?: string,
) {
  if (error instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: error.flatten().fieldErrors,
      },
      400,
    );
  }

  if (logLabel) {
    console.error(`${logLabel}:`, error);
  }

  return c.json({ error: "Internal server error" }, 500);
}
