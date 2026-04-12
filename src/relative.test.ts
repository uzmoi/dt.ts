import { describe, expect, test } from "vitest";
import {
  type CalendarDateObject,
  type DayOfMonth,
  getDaysInMonth,
  getDaysInYear,
} from "./date.ts";
import { daysBetween } from "./relative.ts";

describe("daysBetween", () => {
  test("same date", () => {
    const date: CalendarDateObject = { year: 2000, month: 3, day: 4 };
    expect(daysBetween(date, date)).toBe(0);
  });
  test("+ 1 days", () => {
    const start: CalendarDateObject = { year: 2023, month: 5, day: 6 };
    const end: CalendarDateObject = {
      ...start,
      day: (start.day + 1) as DayOfMonth,
    };
    expect(daysBetween(start, end)).toBe(1);
  });
  test("- 1 days", () => {
    const start: CalendarDateObject = { year: 2023, month: 5, day: 6 };
    const end: CalendarDateObject = {
      ...start,
      day: (start.day - 1) as DayOfMonth,
    };
    expect(daysBetween(start, end)).toBe(-1);
  });
  test("2023-12-07/2025-02-02", () => {
    const start: CalendarDateObject = { year: 2023, month: 12, day: 7 };
    const end: CalendarDateObject = { year: 2025, month: 2, day: 2 };
    expect(daysBetween(start, end)).toBe(
      // biome-ignore format: 可読性
      + getDaysInMonth(2023, 12) - 7
      + getDaysInYear(2024)
      + getDaysInMonth(2025, 1) + 2,
    );
  });
});
