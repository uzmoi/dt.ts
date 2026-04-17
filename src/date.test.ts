import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import * as vremel from "vremel";
import { plainDate } from "../tests/fixtures/fast-check-helpers.ts";
import {
  type CalendarDateObject,
  formatDate,
  getDayOfYear,
  getDaysInMonth,
  getMonthOfOrdinalDay,
  isLeapYear,
  type Month,
  normalizeCalendarDate,
} from "./date.ts";

describe("formatDate", () => {
  test("basic", () => {
    const date: CalendarDateObject = { year: 95, month: 8, day: 4 };
    expect(formatDate(date, "basic")).toBe("00950804");
  });

  test("extended", () => {
    const date: CalendarDateObject = { year: 95, month: 8, day: 4 };
    expect(formatDate(date)).toBe("0095-08-04");
  });
});

describe("getMonthOfOrdinalDay", () => {
  const monthBoundaries = (y: number) => {
    let day = 0;
    const boundaries: [number, number][] = [];
    for (let month = 1; month <= 12; month++) {
      boundaries.push([day + 1, month]);
      day += getDaysInMonth(y, month as Month);
      boundaries.push([day, month]);
    }
    return boundaries;
  };

  test.each(monthBoundaries(2026))("平年の%i日目は%i月", (day, month) => {
    expect(getMonthOfOrdinalDay(2026, day)).toBe(month);
  });

  test.each(monthBoundaries(2024))("閏年の%i日目は%i月", (day, month) => {
    expect(getMonthOfOrdinalDay(2024, day)).toBe(month);
  });

  test.prop([plainDate()])("fuzz", date => {
    const day = vremel.startOfYear(date).until(date).days + 1;

    expect(getMonthOfOrdinalDay(date.year, day)).toBe(date.month);
  });
});

describe("getDayOfYear", () => {
  test("１月１日は 1", () => {
    expect(getDayOfYear({ year: 2026, month: 1, day: 1 })).toBe(1);
  });

  test("平年の12月31日は 365", () => {
    const year = 2026;
    expect.assert(!isLeapYear(year));
    expect(getDayOfYear({ year, month: 12, day: 31 })).toBe(365);
  });

  test("閏年の12月31日は 366", () => {
    const year = 2028;
    expect.assert(isLeapYear(year));
    expect(getDayOfYear({ year, month: 12, day: 31 })).toBe(366);
  });

  test.prop([plainDate()])("fuzz", date => {
    const day = vremel.startOfYear(date).until(date).days + 1;

    expect(getDayOfYear(date)).toBe(day);
  });
});

describe("getDaysInMonth", () => {
  test.each([
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
  ] as const)("平年の%d月", month => {
    const { year, daysInMonth } = new Temporal.PlainYearMonth(2026, month);

    expect(getDaysInMonth(year, month)).toBe(daysInMonth);
  });

  test("閏年の2月", () => {
    const month = 2;
    const { year, daysInMonth } = new Temporal.PlainYearMonth(2028, month);

    expect(getDaysInMonth(year, month)).toBe(daysInMonth);
  });
});

describe("normalizeCalendarDate", () => {
  test.prop([
    plainDate({ max: 9000 }),
    fc.integer({ min: -1000, max: 1000 }),
    fc.integer({ min: -1000, max: 1000 }),
  ])("fuzz", (date, months, days) => {
    const { year, month, day } = date.add({ months }).add({ days });

    fc.pre(1970 < year && year < 9999);

    expect(
      normalizeCalendarDate(date.year, date.month + months, date.day + days),
    ).toEqual({ year, month, day });
  });
});
