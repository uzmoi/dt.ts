import { modulo } from "emnorst";
import {
  dayOfYear,
  daysInMonth,
  isLeapYear,
  leapDays,
  type Month,
} from "./date.ts";
import type { DateObject } from "./datetime.ts";
import type { Head3 } from "./string/utils.ts";

export const DAYS_IN_WEEK = 7;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const Weekday = {
  Sun: 0, // Sunday
  Mon: 1, // Monday
  Tue: 2, // Tuesday
  Wed: 3, // Wednesday
  Thu: 4, // Thursday
  Fri: 5, // Friday
  Sat: 6, // Saturday
} as const satisfies Record<WeekdayStringShort, Weekday>;

export const weekStartDefault: Weekday = Weekday.Sun;

export const dayOfWeek = (date: DateObject): Weekday => {
  const d = date.year + leapDays(date.year - 1) + dayOfYear(date);
  return (d % DAYS_IN_WEEK) as Weekday;
};

const weekDayStringArray = [
  "Sun",
  "Mon",
  "Tues",
  "Wednes", // cspell:disable-line
  "Thurs",
  "Fri",
  "Satur", // cspell:disable-line
] as const;

export type WeekdayStringLong = `${(typeof weekDayStringArray)[number]}day`;
export type WeekdayStringShort = Head3<WeekdayStringLong>;

export const weekdayStringLong = (date: Weekday): WeekdayStringLong => {
  return `${weekDayStringArray[date]}day`;
};

export const weekdayStringShort = (date: Weekday): WeekdayStringShort => {
  return weekDayStringArray[date].slice(0, 3) as WeekdayStringShort;
};

export type WeeksInYear = 52 | 53;

export const weeksInYear = (
  year: number,
  weekStart = weekStartDefault,
): WeeksInYear => {
  const weekday = modulo(
    year + leapDays(year - 1) - weekStart + 1,
    DAYS_IN_WEEK,
  );
  return weekday === 0 && isLeapYear(year) ? 53 : 52;
};

// biome-ignore format: table
export type WeekOfYear =
  | (   | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9)
  | (10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19)
  | (20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29)
  | (30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39)
  | (40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49)
  | (50 | 51 | 52 | 53 | 54);

/**
 * @returns 1..54
 */
export const weekOfYear = (
  date: CalendarDateObject,
  weekStart = weekStartDefault,
): WeekOfYear => {
  const weekdayOffset = dayOfWeek({
    year: date.year,
    month: 1,
    day: 1 + DAYS_IN_WEEK - weekStart,
  });
  return Math.floor(
    (weekdayOffset + dayOfYear(date) - 1) / DAYS_IN_WEEK + 1,
  ) as WeekOfYear;
};

export type WeeksInMonth = 4 | 5 | 6;

export const weeksInMonth = (
  year: number,
  month: Month,
  weekStart?: Weekday,
): WeeksInMonth => {
  const day = daysInMonth(year, month);
  return weekOfMonth({ year, month, day }, weekStart) as WeeksInMonth;
};

export type WeekOfMonth = 1 | 2 | 3 | 4 | 5 | 6;

export const weekOfMonth = (
  date: CalendarDateObject,
  weekStart = weekStartDefault,
): WeekOfMonth => {
  const weekday = dayOfWeek(date);
  // 初週のうち前月の日数 + 今月の日付
  const days = ((weekday - date.day - weekStart + 6) % DAYS_IN_WEEK) + date.day;
  return ((days / DAYS_IN_WEEK + 1) | 0) as WeekOfMonth;
};
