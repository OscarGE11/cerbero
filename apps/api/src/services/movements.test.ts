import { describe, expect, test } from "bun:test";
import { ZodError } from "zod";
import { parseCreateMovementDto, parseMovementFilters } from "./movements.js";

const CATEGORY_ID = "5794f1ec-f434-46a1-b5ab-a7841910cb2d";

describe("parseCreateMovementDto", () => {
  test("accepts valid expense", () => {
    expect(
      parseCreateMovementDto({
        type: "expense",
        title: "Coffee",
        amount: 3.5,
        categoryId: CATEGORY_ID,
      }),
    ).toEqual({
      type: "expense",
      title: "Coffee",
      amount: 3.5,
      categoryId: CATEGORY_ID,
    });
  });

  test("rejects categoryId and customCategory together", () => {
    expect(() =>
      parseCreateMovementDto({
        type: "expense",
        title: "X",
        amount: 1,
        categoryId: CATEGORY_ID,
        customCategory: "Other",
      }),
    ).toThrow(ZodError);
  });

  test("rejects non-positive amount", () => {
    expect(() =>
      parseCreateMovementDto({
        type: "expense",
        title: "X",
        amount: 0,
      }),
    ).toThrow(ZodError);
  });
});

describe("parseMovementFilters", () => {
  test("parses pagination and text filters", () => {
    expect(
      parseMovementFilters({
        page: "2",
        pageSize: "20",
        title: "super",
        sortBy: "amount",
        sortOrder: "asc",
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      title: "super",
      sortBy: "amount",
      sortOrder: "asc",
    });
  });

  test("parses categoryIds CSV into array", () => {
    expect(
      parseMovementFilters({
        categoryIds: `${CATEGORY_ID},a1b2c3d4-e5f6-7890-abcd-ef1234567890`,
      }).categoryIds,
    ).toEqual([CATEGORY_ID, "a1b2c3d4-e5f6-7890-abcd-ef1234567890"]);
  });

  test("coerces includeCustom boolean", () => {
    expect(parseMovementFilters({ includeCustom: "true" }).includeCustom).toBe(
      true,
    );
  });
});
