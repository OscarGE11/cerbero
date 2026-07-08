import { describe, expect, test } from "bun:test";
import { RateLimiter } from "./rate-limit.js";

describe("RateLimiter", () => {
  test("allows up to the limit then blocks", () => {
    const limiter = new RateLimiter(3, 60_000);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(true);

    const blocked = limiter.check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  test("tracks keys independently", () => {
    const limiter = new RateLimiter(1, 60_000);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);
    expect(limiter.check("b").allowed).toBe(true);
  });

  test("reset clears a key", () => {
    const limiter = new RateLimiter(1, 60_000);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);

    limiter.reset("a");
    expect(limiter.check("a").allowed).toBe(true);
  });

  test("window expiry allows again", () => {
    const limiter = new RateLimiter(1, 5);

    expect(limiter.check("a").allowed).toBe(true);
    expect(limiter.check("a").allowed).toBe(false);

    const start = Date.now();
    while (Date.now() - start < 10) {
      // busy-wait past the tiny window
    }

    expect(limiter.check("a").allowed).toBe(true);
  });
});
