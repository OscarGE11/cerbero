import { describe, expect, test } from "bun:test";
import { toCategory, toMovement, toUserCategory } from "./mappers.js";

describe("toCategory", () => {
  test("maps row with icon", () => {
    expect(
      toCategory({
        id: "c1",
        name: "Food",
        type: "expense",
        icon: "utensils",
      }),
    ).toEqual({
      id: "c1",
      name: "Food",
      type: "expense",
      icon: "utensils",
    });
  });

  test("omits icon when null", () => {
    expect(
      toCategory({ id: "c1", name: "Food", type: "income", icon: null }),
    ).toEqual({
      id: "c1",
      name: "Food",
      type: "income",
    });
  });
});

describe("toUserCategory", () => {
  test("maps user category row", () => {
    expect(
      toUserCategory({
        id: "uc1",
        user_id: "u1",
        name: "Gimnasio",
        type: "expense",
        use_count: 3,
        last_used_at: "2026-07-03T10:00:00Z",
        created_at: "2026-07-01T10:00:00Z",
      }),
    ).toEqual({
      id: "uc1",
      name: "Gimnasio",
      type: "expense",
      useCount: 3,
      lastUsedAt: "2026-07-03T10:00:00Z",
      createdAt: "2026-07-01T10:00:00Z",
    });
  });
});

describe("toMovement", () => {
  test("maps full movement row", () => {
    expect(
      toMovement({
        id: "m1",
        user_id: "u1",
        type: "expense",
        title: "Coffee",
        amount: 2.5,
        category_id: "c1",
        custom_category: null,
        comment: "morning",
        date: "2026-07-01",
        created_at: "2026-07-01T10:00:00Z",
      }),
    ).toEqual({
      id: "m1",
      userId: "u1",
      type: "expense",
      title: "Coffee",
      amount: 2.5,
      categoryId: "c1",
      comment: "morning",
      date: "2026-07-01",
      createdAt: "2026-07-01T10:00:00Z",
    });
  });

  test("maps custom category without categoryId", () => {
    const movement = toMovement({
      id: "m2",
      user_id: "u1",
      type: "income",
      title: "Gift",
      amount: 50,
      category_id: null,
      custom_category: "Regalo",
      comment: null,
      date: "2026-07-02",
      created_at: "2026-07-02T12:00:00Z",
    });

    expect(movement.customCategory).toBe("Regalo");
    expect(movement.categoryId).toBeUndefined();
    expect(movement.comment).toBeUndefined();
  });
});
