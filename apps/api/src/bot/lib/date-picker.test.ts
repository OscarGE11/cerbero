import { describe, expect, test } from "bun:test";
import {
  daysInMonth,
  formatMonthButtonLabel,
  getRecentMonths,
  shiftIsoDate,
} from "./date-picker.js";

describe("shiftIsoDate", () => {
  test("returns today for 0 days ago", () => {
    const today = new Date();
    const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    expect(shiftIsoDate(0)).toBe(expected);
  });

  test("returns yesterday for 1 day ago", () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const expected = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    expect(shiftIsoDate(1)).toBe(expected);
  });
});

describe("getRecentMonths", () => {
  test("returns consecutive months in YYYY-MM format", () => {
    const months = getRecentMonths(3);
    expect(months).toHaveLength(3);
    for (const month of months) {
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    }
  });
});

describe("daysInMonth", () => {
  test("counts days in July", () => {
    expect(daysInMonth("2026-07")).toBe(31);
  });

  test("counts days in February on leap year", () => {
    expect(daysInMonth("2024-02")).toBe(29);
  });
});

describe("formatMonthButtonLabel", () => {
  test("capitalizes Spanish month label", () => {
    const label = formatMonthButtonLabel("2026-07");
    expect(label.charAt(0)).toBe(label.charAt(0).toUpperCase());
    expect(label).toContain("2026");
  });
});
