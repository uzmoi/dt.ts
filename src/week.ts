import { modulo } from "@uzmoi/ut/ils";
import {
  type CalendarDateObject,
  getDayOfYear,
  getDaysInMonth,
  isLeapYear,
  leapDays,
  type Month,
} from "./date.ts";
import type { Head3 } from "./string/utils.ts";

export const DAYS_IN_WEEK = 7;

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const Weekday: Record<WeekdayStringShort, Weekday> = {
  Sun: 0, // Sunday
  Mon: 1, // Monday
  Tue: 2, // Tuesday
  Wed: 3, // Wednesday
  Thu: 4, // Thursday
  Fri: 5, // Friday
  Sat: 6, // Saturday
};

export const weekStartDefault: Weekday = Weekday.Sun;

export const getDayOfWeek = (date: CalendarDateObject): Weekday => {
  const d = date.year + leapDays(date.year - 1) + getDayOfYear(date) - 1;
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

export const getWeekdayStringLong = (date: Weekday): WeekdayStringLong => {
  return `${weekDayStringArray[date]}day`;
};

export const getWeekdayStringShort = (date: Weekday): WeekdayStringShort => {
  return weekDayStringArray[date].slice(0, 3) as WeekdayStringShort;
};

export type WeeksInYear = 53 | 54;

export const getWeeksInYear = (
  year: number,
  weekStart: Weekday = weekStartDefault,
): WeeksInYear => {
  // 元日が週の何日目か
  const weekday =
    (year + leapDays(year - 1) - weekStart + DAYS_IN_WEEK) % DAYS_IN_WEEK;

  // 7 * 52 === 364
  // 平年は必ず53週になる。
  // 閏年も基本的には53週だが、元日が週の終わりだと大晦日が週の始まりとなり54週になる。
  return weekday === 6 && isLeapYear(year) ? 54 : 53;
};

// biome-ignore format: table
export type WeekOfYear =
  | (1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9  | 10)
  | (11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20)
  | (21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30)
  | (31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40)
  | (41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50)
  | (51 | 52 | 53 | 54);

/**
 * @returns 1..54
 */
export const getWeekOfYear = (
  date: CalendarDateObject,
  weekStart: Weekday = weekStartDefault,
): WeekOfYear => {
  const daysInPreviousYear =
    (date.year + leapDays(date.year - 1) - weekStart + DAYS_IN_WEEK) %
    DAYS_IN_WEEK;

  // 初週のうち前年の日数 + 今年の日数
  const days = daysInPreviousYear + getDayOfYear(date);
  return Math.ceil(days / DAYS_IN_WEEK) as WeekOfMonth;
};

export type WeeksInMonth = 4 | 5 | 6;

export const getWeeksInMonth = (
  year: number,
  month: Month,
  weekStart?: Weekday,
): WeeksInMonth => {
  const day = getDaysInMonth(year, month);
  return getWeekOfMonth({ year, month, day }, weekStart) as WeeksInMonth;
};

export type WeekOfMonth = 1 | 2 | 3 | 4 | 5 | 6;

export const getWeekOfMonth = (
  date: CalendarDateObject,
  weekStart: Weekday = weekStartDefault,
): WeekOfMonth => {
  const weekday = getDayOfWeek(date);

  const daysInPreviousMonth = modulo(
    weekday - date.day - weekStart + 1,
    DAYS_IN_WEEK,
  );

  // 初週のうち前月の日数 + 今月の日付
  const days = daysInPreviousMonth + date.day;
  return Math.ceil(days / DAYS_IN_WEEK) as WeekOfMonth;
};
