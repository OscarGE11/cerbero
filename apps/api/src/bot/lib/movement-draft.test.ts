import { describe, expect, test } from "bun:test";
import type { MovementDraft } from "../types.js";
import { buildMovementSummary, parsePositiveAmount } from "./movement-draft.js";

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

describe("buildMovementSummary", () => {
  test("renders draft summary in Spanish", () => {
    const draft: MovementDraft = {
      type: "expense",
      categoryName: "Comida",
      title: "Mercadona",
      amount: 42.1,
      comment: "semana",
    };

    const summary = buildMovementSummary(draft);

    expect(summary).toContain("Gasto");
    expect(summary).toContain("Comida");
    expect(summary).toContain("Mercadona");
    expect(summary).toContain("semana");
  });
});
