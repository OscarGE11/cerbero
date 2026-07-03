import { afterEach, describe, expect, test } from "bun:test";
import { collectOriginCandidates, toOrigin } from "./public-url.js";

describe("toOrigin", () => {
  test("normalizes full URL to origin", () => {
    expect(toOrigin("https://cerbero-api.up.railway.app/health")).toBe(
      "https://cerbero-api.up.railway.app",
    );
  });

  test("adds https to bare domain", () => {
    expect(toOrigin("cerbero-api.up.railway.app")).toBe(
      "https://cerbero-api.up.railway.app",
    );
  });

  test("rejects path-only values", () => {
    expect(toOrigin("/health")).toBeNull();
  });
});

describe("collectOriginCandidates", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  test("deduplicates configured origins", () => {
    process.env.PUBLIC_API_URL = "https://api.example.com";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.com/path";
    process.env.RAILWAY_PUBLIC_DOMAIN = "api.example.com";

    expect(collectOriginCandidates()).toEqual(["https://api.example.com"]);
  });
});
