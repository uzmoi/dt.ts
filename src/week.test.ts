import { fc, test } from "@fast-check/vitest";
import * as dateFns from "date-fns";
import { describe, expect } from "vitest";
import { type DayOfMonth, isLeapYear, type Month } from "./date.ts";
import {
  getDayOfWeek,
  getWeekdayStringLong,
  getWeekdayStringShort,
  getWeekOfMonth,
  getWeekOfYear,
  getWeeksInMonth,
  getWeeksInYear,
  Weekday,
} from "./week.ts";

const dateArbitrary = fc.date({
  min: new Date("1970-01-01T00:00:00Z"),
  max: new Date("9999-12-31T23:59:59Z"),
  noInvalidDate: true,
});

describe("getDayOfWeek", () => {
  test.prop([dateArbitrary])("fuzz", date => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as Month;
    const day = date.getDate() as DayOfMonth;

    expect(getDayOfWeek({ year, month, day })).toBe(date.getDay());
  });
});

describe("getWeekdayStringShort / getWeekdayStringLong", () => {
  test.each(Object.entries(Weekday))("short %s", (string, weekday) => {
    expect(getWeekdayStringShort(weekday)).toBe(string);
  });

  test.each(Object.entries(Weekday))("long %s", (_, weekday) => {
    expect(getWeekdayStringLong(weekday)).toBe(
      dateFns.format(dateFns.setDay(new Date(), weekday), "EEEE"),
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

  test.prop([dateArbitrary, fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1) as Month;
      const day = date.getDate() as DayOfMonth;

      expect(getWeekOfYear({ year, month, day }, weekStart as Weekday)).toBe(
        dateFns.eachWeekOfInterval(
          { start: dateFns.startOfYear(date), end: date },
          { weekStartsOn: weekStart as Weekday },
        ).length,
      );
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

  test.prop([dateArbitrary, fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1) as Month;

      expect(getWeeksInMonth(year, month, weekStart as Weekday)).toBe(
        dateFns.getWeeksInMonth(date, { weekStartsOn: weekStart as Weekday }),
      );
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

  test.prop([dateArbitrary, fc.integer({ min: 0, max: 6 })])(
    "fuzz",
    (date, weekStart) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1) as Month;
      const day = date.getDate() as DayOfMonth;

      expect(getWeekOfMonth({ year, month, day }, weekStart as Weekday)).toBe(
        dateFns.getWeekOfMonth(date, { weekStartsOn: weekStart as Weekday }),
      );
    },
  );
});
