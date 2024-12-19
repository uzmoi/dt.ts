import { describe, expect, test } from "@jest/globals";
import { DateTime } from "./datetime";
import {
    Weekday,
    dayOfWeek,
    dayOfYear,
    isLeapYear,
    weekOfMonth,
    weekOfYear,
    weeksInMonth,
    weeksInYear,
} from "./number";

test.each([
    { leap: false, weekDay: 0 },
    { leap: false, weekDay: 6 },
    { leap: true, weekDay: 0 },
    { leap: true, weekDay: 6 },
    { leap: true, weekDay: 5, weekStart: Weekday.Mon },
    { leap: true, weekDay: 0, weekStart: Weekday.Mon },
])(
    "weeksInYear / leap=$leap, weekday=$weekDay, weekStart=$weekStart",
    ({ leap, weekDay, weekStart }) => {
        let year = 2000;
        while (
            isLeapYear(year) !== leap ||
            dayOfWeek({ year, month: 1, day: 1 }) !== weekDay
        ) {
            year++;
        }
        const expectWeeksInYear = weekOfYear(
            DateTime.from([year]).endOf("year"),
            weekStart,
        );
        expect(weeksInYear(year, weekStart)).toBe(expectWeeksInYear);
    },
);

describe("weekOfYear", () => {
    test("weekOfYear", () => {
        expect(weekOfYear({ year: 2023, month: 1, day: 1 })).toBe(0);
        expect(weekOfYear({ year: 2023, month: 1, day: 7 })).toBe(0);
        expect(weekOfYear({ year: 2023, month: 1, day: 8 })).toBe(1);
    });
    test("weekStart", () => {
        expect(weekOfYear({ year: 2023, month: 1, day: 2 }, 1)).toBe(1);
    });
});

test.each([
    { year: 2015, month: 2, weeks: 4 },
    { year: 2016, month: 2, weeks: 5 },
    { year: 2026, month: 2, weeks: 4 },
    { year: 2023, month: 3, weeks: 5 },
    { year: 2023, month: 4, weeks: 6 },
    { year: 2023, month: 10, weeks: 5 },
    { year: 2023, month: 10, weeks: 6, weekStart: Weekday.Mon },
])(
    "weeksInMonth($year, $month, $weekStart) === $weeks",
    ({ year, month, weeks: expected, weekStart }) => {
        expect(weeksInMonth(year, month, weekStart)).toBe(expected);
    },
);

describe("weekOfMonth", () => {
    describe("1日に週が始まる場合", () => {
        test("7日は1", () => {
            expect(weekOfMonth({ year: 2023, month: 1, day: 7 })).toBe(1);
        });
        test("8日は2", () => {
            expect(weekOfMonth({ year: 2023, month: 1, day: 8 })).toBe(2);
        });
    });
    describe("2日に週が始まる場合", () => {
        test("1日は1", () => {
            expect(weekOfMonth({ year: 2023, month: 4, day: 1 })).toBe(1);
        });
        test("2日は2", () => {
            expect(weekOfMonth({ year: 2023, month: 4, day: 2 })).toBe(2);
        });
    });
});

test.each(Array.from({ length: 12 }, (_, i) => DateTime.from([2022, i + 1])))(
    "dayOfYear('%s')",
    dt => {
        expect(dayOfYear(dt)).toBe((+dt - +dt.startOf("year")) / 86400000);
        expect(dt.startOf("year").plus({ days: dayOfYear(dt) })).toEqual(dt);
    },
);

test.todo("weekday");
