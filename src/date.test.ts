import { fc, test } from "@fast-check/vitest";
import * as dateFns from "date-fns";
import { describe, expect } from "vitest";
import {
  type CalendarDateObject,
  type DayOfMonth,
  formatDate,
  getDayOfYear,
  getDaysInMonth,
  getMonthOfOrdinalDay,
  type Month,
  normalizeCalendarDate,
} from "./date.ts";

fc.configureGlobal({ seed: 12345678 });

const dateArbitrary = fc.date({
  min: new Date("1970-01-01T00:00:00Z"),
  max: new Date("9999-12-31T23:59:59Z"),
  noInvalidDate: true,
});

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

  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;

    expect(getMonthOfOrdinalDay(year, dateFns.getDayOfYear(date))).toBe(month);
  });
});

describe("getDayOfYear", () => {
  test("getDayOfYear 1", () => {
    expect(getDayOfYear({ year: 2026, month: 1, day: 1 })).toBe(1);
  });

  test("getDayOfYear 365", () => {
    expect(getDayOfYear({ year: 2026, month: 12, day: 31 })).toBe(365);
  });

  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;
    const day = date.getDate() as DayOfMonth;

    expect(getDayOfYear({ year, month, day })).toBe(dateFns.getDayOfYear(date));
  });
});

describe("getDaysInMonth", () => {
  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;

    expect(getDaysInMonth(year, month)).toBe(dateFns.getDaysInMonth(date));
  });
});

describe("normalizeCalendarDate", () => {
  test.prop([fc.integer({ min: 1970, max: 9999 }), fc.integer(), fc.integer()])(
    "fuzz",
    (year, month, day) => {
      const date = new Date();
      date.setFullYear(year);
      date.setMonth(month - 1);
      date.setDate(day);

      fc.pre(!Number.isNaN(date.getTime()));

      expect(normalizeCalendarDate(year, month, day)).toEqual({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      });
    },
  );
});
