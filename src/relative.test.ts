import { describe, expect, test } from "@jest/globals";
import type { DateObject } from "./datetime";
import { daysInMonth, daysInYear } from "./number";
import { daysBetween } from "./relative";

describe("daysBetween", () => {
  test("same date", () => {
    const date: DateObject = { year: 2000, month: 3, day: 4 };
    expect(daysBetween(date, date)).toBe(0);
  });
  test("+ 1 days", () => {
    const start: DateObject = { year: 2023, month: 5, day: 6 };
    const end: DateObject = { ...start, day: start.day + 1 };
    expect(daysBetween(start, end)).toBe(1);
  });
  test("- 1 days", () => {
    const start: DateObject = { year: 2023, month: 5, day: 6 };
    const end: DateObject = { ...start, day: start.day - 1 };
    expect(daysBetween(start, end)).toBe(-1);
  });
  test("2023-12-07/2025-02-02", () => {
    const start: DateObject = { year: 2023, month: 12, day: 7 };
    const end: DateObject = { year: 2025, month: 2, day: 2 };
    expect(daysBetween(start, end)).toBe(
      // prettier-ignore
      + daysInMonth(2023, 12) - 7
      + daysInYear(2024)
      + daysInMonth(2025, 1) + 2,
    );
  });
});
