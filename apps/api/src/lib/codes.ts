import { randomInt } from "node:crypto";

/** Cryptographically secure 6-digit code (100000-999999). */
export function generateSixDigitCode(): string {
  return String(randomInt(100000, 1000000));
}
