import { describe, expect, test } from "bun:test";
import {
  applyMovementFilters,
  applyMovementSort,
  createQueryRecorder,
} from "./movement-query.js";

const CATEGORY_ID = "5794f1ec-f434-46a1-b5ab-a7841910cb2d";

describe("applyMovementFilters", () => {
  test("applies text and amount filters", () => {
    const { query, calls } = createQueryRecorder();

    applyMovementFilters(query, {
      title: "coffee",
      minAmount: 5,
      maxAmount: 50,
    });

    expect(calls).toEqual([
      { method: "ilike", args: ["title", "%coffee%"] },
      { method: "gte", args: ["amount", 5] },
      { method: "lte", args: ["amount", 50] },
    ]);
  });

  test("applies categoryIds with includeCustom OR filter", () => {
    const { query, calls } = createQueryRecorder();

    applyMovementFilters(query, {
      categoryIds: [CATEGORY_ID],
      includeCustom: true,
      customCategory: "regalo",
    });

    expect(calls).toEqual([
      {
        method: "or",
        args: [
          `category_id.in.(${CATEGORY_ID}),custom_category.ilike.%regalo%`,
        ],
      },
    ]);
  });
});

describe("applyMovementSort", () => {
  test("defaults to date desc", () => {
    const { query, calls } = createQueryRecorder();

    applyMovementSort(query, {});

    expect(calls).toEqual([
      { method: "order", args: ["date", { ascending: false }] },
      { method: "order", args: ["created_at", { ascending: false }] },
    ]);
  });

  test("sorts by amount ascending", () => {
    const { query, calls } = createQueryRecorder();

    applyMovementSort(query, { sortBy: "amount", sortOrder: "asc" });

    expect(calls).toEqual([
      { method: "order", args: ["amount", { ascending: true }] },
    ]);
  });
});
