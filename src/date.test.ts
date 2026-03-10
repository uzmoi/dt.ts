import { fc, test } from "@fast-check/vitest";
import * as dateFns from "date-fns";
import { describe, expect } from "vitest";
import {
  type CalendarDateObject,
  type DayOfMonth,
  dayOfYear,
  daysInMonth,
  formatDate,
  type Month,
  monthOfOrdinalDay,
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

describe("monthOfOrdinalDay", () => {
  const monthBoundaries = (y: number) => {
    let day = 0;
    const boundaries: [number, number][] = [];
    for (let month = 1; month <= 12; month++) {
      boundaries.push([day + 1, month]);
      day += daysInMonth(y, month as Month);
      boundaries.push([day, month]);
    }
    return boundaries;
  };

  test.each(monthBoundaries(2026))("平年の%i日目は%i月", (day, month) => {
    expect(monthOfOrdinalDay(2026, day)).toBe(month);
  });

  test.each(monthBoundaries(2024))("閏年の%i日目は%i月", (day, month) => {
    expect(monthOfOrdinalDay(2024, day)).toBe(month);
  });

  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;

    expect(monthOfOrdinalDay(year, dateFns.getDayOfYear(date))).toBe(month);
  });
});

describe("dayOfYear", () => {
  test("dayOfYear 1", () => {
    expect(dayOfYear({ year: 2026, month: 1, day: 1 })).toBe(1);
  });
  test("dayOfYear 365", () => {
    expect(dayOfYear({ year: 2026, month: 12, day: 31 })).toBe(365);
  });

  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;
    const day = date.getDate() as DayOfMonth;

    expect(dayOfYear({ year, month, day })).toBe(dateFns.getDayOfYear(date));
  });
});

describe("daysInMonth", () => {
  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;

    expect(daysInMonth(year, month)).toBe(dateFns.getDaysInMonth(date));
  });
});
