import { describe, expect, test } from "vitest";
import {
  type CalendarDateObject,
  dayOfYear,
  daysInMonth,
  formatDate,
  type Month,
  monthOfOrdinalDay,
} from "./date.ts";
import { DateTime } from "./datetime.ts";

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
});

test.each(
  Array.from({ length: 12 }, (_, i) => DateTime.from([2022, i + 1])),
)("dayOfYear('%s')", dt => {
  expect(dayOfYear(dt)).toBe((+dt - +dt.startOf("year")) / 86400000);
  expect(dt.startOf("year").plus({ days: dayOfYear(dt) })).toEqual(dt);
});
