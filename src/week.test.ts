import { fc, test } from "@fast-check/vitest";
import { describe, expect } from "vitest";
import * as vremel from "vremel";
import { plainDate } from "../tests/fixtures/fast-check-helpers.ts";
import { isLeapYear, type Month } from "./date.ts";
import {
  getDayOfWeek,
  getShortWeekdayName,
  getWeekdayName,
  getWeekOfMonth,
  getWeekOfYear,
  getWeeksInMonth,
  getWeeksInYear,
  Weekday,
} from "./week.ts";

describe("getDayOfWeek", () => {
  test.prop([plainDate()])("fuzz", date => {
    expect(getDayOfWeek(date)).toBe(date.dayOfWeek);
  });
});

describe("getWeekdayName / getShortWeekdayName", () => {
  test.each(Object.entries(Weekday))("short %s", (string, weekday) => {
    expect(getShortWeekdayName(weekday)).toBe(string);
  });

  test.each(Object.entries(Weekday))("long %s", (_, weekday) => {
    const formatter = Intl.DateTimeFormat("en", { weekday: "long" });

    const date = vremel.withDayOfWeek(
      Temporal.Now.plainDateISO(),
      weekday || 7,
      { firstDayOfWeek: 7 },
    );

    expect(getWeekdayName(weekday)).toBe(
      // biome-ignore lint/style/noNonNullAssertion: 見つからないならテスト落ちてくれ。
      formatter.formatToParts(date).find(part => part.type === "weekday")!
        .value,
    );
  });
});

describe("getWeeksInYear", () => {
  test.each([
    { leap: false, weekDay: 0 },
    { leap: false, weekDay: 6 },
    { leap: true, weekDay: 0 },
    { leap: true, weekDay: 6 },
    { leap: true, weekDay: 5, weekStart: Weekday.Mon },
    { leap: true, weekDay: 0, weekStart: Weekday.Mon },
  ])("getWeeksInYear / leap=$leap, weekday=$weekDay, weekStart=$weekStart", ({
    leap,
    weekDay,
    weekStart,
  }) => {
    let year = 2000;
    while (
      isLeapYear(year) !== leap ||
      getDayOfWeek({ year, month: 1, day: 1 }) !== weekDay
    ) {
      year++;
    }

    expect(getWeeksInYear(year, weekStart)).toBe(
      getWeekOfYear({ year, month: 12, day: 31 }, weekStart),
    );
  });
});

describe("getWeekOfYear", () => {
  test("getWeekOfYear", () => {
    expect(getWeekOfYear({ year: 2023, month: 1, day: 1 })).toBe(1);
    expect(getWeekOfYear({ year: 2023, month: 1, day: 7 })).toBe(1);
    expect(getWeekOfYear({ year: 2023, month: 1, day: 8 })).toBe(2);
  });

  test("weekStart", () => {
    expect(getWeekOfYear({ year: 2023, month: 1, day: 2 }, Weekday.Mon)).toBe(
      2,
    );
  });

  test.prop([plainDate(), fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      expect.assert(date.yearOfWeek === date.year);

      expect(getWeekOfYear(date, weekStart as Weekday)).toBe(date.weekOfYear);
    },
  );
});

describe("getWeeksInMonth", () => {
  test.each([
    { year: 2015, month: 2, weeks: 4 },
    { year: 2016, month: 2, weeks: 5 },
    { year: 2026, month: 2, weeks: 4 },
    { year: 2023, month: 3, weeks: 5 },
    { year: 2023, month: 4, weeks: 6 },
    { year: 2023, month: 10, weeks: 5 },
    { year: 2023, month: 10, weeks: 6, weekStart: Weekday.Mon },
  ] as const)("getWeeksInMonth($year, $month, $weekStart) === $weeks", ({
    year,
    month,
    weeks: expected,
    weekStart,
  }) => {
    expect(getWeeksInMonth(year, month, weekStart)).toBe(expected);
  });

  test.prop([plainDate(), fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      const start = vremel.startOfWeek(vremel.startOfMonth(date), {
        firstDayOfWeek: weekStart || 7,
      });
      const end = vremel
        .startOfWeek(vremel.endOfMonth(date), {
          firstDayOfWeek: weekStart || 7,
        })
        .add({ weeks: 1 });

      expect(
        getWeeksInMonth(date.year, date.month as Month, weekStart as Weekday),
      ).toBe(start.until(end).days / 7);
    },
  );
});

describe("getWeekOfMonth", () => {
  describe("1日に週が始まる場合", () => {
    test("7日は1", () => {
      expect(getWeekOfMonth({ year: 2023, month: 1, day: 7 })).toBe(1);
    });

    test("8日は2", () => {
      expect(getWeekOfMonth({ year: 2023, month: 1, day: 8 })).toBe(2);
    });
  });

  describe("2日に週が始まる場合", () => {
    test("1日は1", () => {
      expect(getWeekOfMonth({ year: 2023, month: 4, day: 1 })).toBe(1);
    });

    test("2日は2", () => {
      expect(getWeekOfMonth({ year: 2023, month: 4, day: 2 })).toBe(2);
    });
  });

  test.prop([plainDate(), fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      const start = vremel.startOfWeek(vremel.startOfMonth(date), {
        firstDayOfWeek: weekStart || 7,
      });
      const end = vremel
        .startOfWeek(date, { firstDayOfWeek: weekStart || 7 })
        .add({ weeks: 1 });

      expect(getWeekOfMonth(date, weekStart as Weekday)).toBe(
        start.until(end).days / 7,
      );
    },
  );
});
