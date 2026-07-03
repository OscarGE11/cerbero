import { describe, expect, test } from "bun:test";
import type { Movement } from "../types/index.js";
import { computeMonthSummary, getMonthDateRange } from "./month-summary.js";

describe("getMonthDateRange", () => {
  test("returns full month range", () => {
    expect(getMonthDateRange("2026-07")).toEqual({
      from: "2026-07-01",
      to: "2026-07-31",
    });
  });

  test("handles february in leap year", () => {
    expect(getMonthDateRange("2024-02")).toEqual({
      from: "2024-02-01",
      to: "2024-02-29",
    });
  });
});

describe("computeMonthSummary", () => {
  const movements: Movement[] = [
    {
      id: "1",
      userId: "u1",
      type: "expense",
      title: "A",
      amount: 30,
      date: "2026-07-01",
      createdAt: "2026-07-01T00:00:00Z",
    },
    {
      id: "2",
      userId: "u1",
      type: "expense",
      title: "B",
      amount: 20,
      date: "2026-07-02",
      createdAt: "2026-07-02T00:00:00Z",
    },
    {
      id: "3",
      userId: "u1",
      type: "income",
      title: "Salary",
      amount: 100,
      date: "2026-07-03",
      createdAt: "2026-07-03T00:00:00Z",
    },
  ];

  test("aggregates expenses, income and balance", () => {
    expect(computeMonthSummary("2026-07", movements)).toEqual({
      month: "2026-07",
      expenses: 50,
      income: 100,
      balance: 50,
    });
  });
});
