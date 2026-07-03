import type { Context } from "hono";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

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

  if (error instanceof HttpError) {
    return c.json({ error: error.message }, error.status as 404);
  }

  if (logLabel) {
    console.error(`${logLabel}:`, error);
  }

  return c.json({ error: "Internal server error" }, 500);
}
