import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string comparison to avoid timing attacks on secrets
 * (webhook tokens, HMAC hashes). Length is not secret, so an early
 * length mismatch return is acceptable.
 */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}
