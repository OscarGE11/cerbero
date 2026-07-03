import { describe, expect, test } from "bun:test";
import type { MovementDraft } from "../types.js";
import {
  buildMovementSummary,
  parseMovementDate,
  parsePositiveAmount,
  todayIsoDate,
} from "./movement-draft.js";

describe("parsePositiveAmount", () => {
  test("parses decimal with dot", () => {
    expect(parsePositiveAmount("25.50")).toBe(25.5);
  });

  test("parses decimal with comma", () => {
    expect(parsePositiveAmount("25,50")).toBe(25.5);
  });

  test("rejects zero and invalid input", () => {
    expect(parsePositiveAmount("0")).toBeNull();
    expect(parsePositiveAmount("abc")).toBeNull();
  });
});

describe("parseMovementDate", () => {
  test("parses ISO date", () => {
    expect(parseMovementDate("2026-07-03")).toBe("2026-07-03");
  });

  test("parses Spanish date", () => {
    expect(parseMovementDate("03/07/2026")).toBe("2026-07-03");
  });

  test("rejects invalid dates", () => {
    expect(parseMovementDate("32/01/2026")).toBeNull();
    expect(parseMovementDate("hoy")).toBeNull();
  });
});

describe("todayIsoDate", () => {
  test("returns YYYY-MM-DD format", () => {
    expect(todayIsoDate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("buildMovementSummary", () => {
  test("renders draft summary in Spanish", () => {
    const draft: MovementDraft = {
      type: "expense",
      categoryName: "Comida",
      title: "Mercadona",
      amount: 42.1,
      date: "2026-07-01",
    };

    const summary = buildMovementSummary(draft);

    expect(summary).toContain("Gasto");
    expect(summary).toContain("Comida");
    expect(summary).toContain("Mercadona");
    expect(summary).toContain("julio");
  });
});
