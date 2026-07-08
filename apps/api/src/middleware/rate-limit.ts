import type { Context, Next } from "hono";
import { RateLimiter } from "../lib/rate-limit.js";

function getClientKey(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return c.req.header("x-real-ip")?.trim() || "unknown";
}

/**
 * Fixed-window per-IP rate limit middleware. Returns 429 with a
 * Retry-After header when the limit is exceeded.
 */
export function rateLimit(options: {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
}) {
  const limiter = new RateLimiter(options.limit, options.windowMs);
  const prefix = options.keyPrefix ?? "rl";

  return async function rateLimitMiddleware(c: Context, next: Next) {
    const result = limiter.check(`${prefix}:${getClientKey(c)}`);

    if (!result.allowed) {
      c.header("Retry-After", String(Math.ceil(result.retryAfterMs / 1000)));
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}
