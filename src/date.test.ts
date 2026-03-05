import { describe, expect, test } from "vitest";
import { type CalendarDateObject, dayOfYear, formatDate } from "./date.ts";
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

test.each(
  Array.from({ length: 12 }, (_, i) => DateTime.from([2022, i + 1])),
)("dayOfYear('%s')", dt => {
  expect(dayOfYear(dt)).toBe((+dt - +dt.startOf("year")) / 86400000);
  expect(dt.startOf("year").plus({ days: dayOfYear(dt) })).toEqual(dt);
});
