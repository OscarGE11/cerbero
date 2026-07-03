import { describe, expect, test } from "bun:test";
import { generateSixDigitCode } from "./codes.js";

describe("generateSixDigitCode", () => {
  test("returns a 6-digit string", () => {
    const code = generateSixDigitCode();
    expect(code).toMatch(/^\d{6}$/);
    expect(Number(code)).toBeGreaterThanOrEqual(100000);
    expect(Number(code)).toBeLessThanOrEqual(999999);
  });
});
