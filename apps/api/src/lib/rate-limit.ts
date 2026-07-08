interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * In-memory fixed-window rate limiter. Suitable for a single-instance
 * deployment (Railway). For multi-instance scaling, back this with a
 * shared store (e.g. Redis).
 */
export class RateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string): RateLimitResult {
    const now = Date.now();
    this.pruneIfNeeded(now);

    const bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true, remaining: this.limit - 1, retryAfterMs: 0 };
    }

    if (bucket.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs: bucket.resetAt - now,
      };
    }

    bucket.count += 1;
    return {
      allowed: true,
      remaining: this.limit - bucket.count,
      retryAfterMs: 0,
    };
  }

  reset(key: string): void {
    this.buckets.delete(key);
  }

  private pruneIfNeeded(now: number): void {
    if (this.buckets.size < 1000) return;
    for (const [key, bucket] of this.buckets) {
      if (now >= bucket.resetAt) this.buckets.delete(key);
    }
  }
}
