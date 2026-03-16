import { formatInt } from "./string/utils.ts";
import type { Weekday, WeekOfMonth } from "./week.ts";

export interface CalendarDateObject {
  year: number;
  month: Month;
  day: number;
}

export interface OrdinalDateObject {
  year: number;
  /** 1..366 */
  day: number;
}

export interface CalendarWeekDateObject {
  year: number;
  month: Month;
  /** 1..6 */
  week: WeekOfMonth;
  weekday: Weekday;
}

export interface OrdinalWeekDateObject {
  year: number;
  /** 1..53 */
  week: number;
  weekday: Weekday;
}

export type DateObject =
  | CalendarDateObject
  | OrdinalDateObject
  | CalendarWeekDateObject
  | OrdinalWeekDateObject;

export const formatDate = (
  date: CalendarDateObject,
  format?: "extended" | "basic",
): string => {
  return [
    formatInt(date.year, 4),
    formatInt(date.month, 2),
    formatInt(date.day, 2),
  ].join(format === "basic" ? "" : "-");
};

// Leap

export const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

export const leapDays = (year: number): number => {
  // year >> 2 === Math.floor(year / 4)
  return (year >> 2) - ((year / 100) | 0) + ((year / 400) | 0);
};

// Month

export const MONTHS_IN_YEAR = 12;

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export const monthOfOrdinalDay = (year: number, ordinalDay: number): Month => {
  // 係数を機械の力で探索した式
  // なぜ1月と2月は+365すると動くのかは謎

  const d =
    ordinalDay +
    (ordinalDay < 31 + 28 ? DAYS_IN_YEAR_WITHOUT_LEAP_DAY : -isLeapYear(year));

  const m = ((d + 63) / 30.61 + 10) | 0;

  return ((m % MONTHS_IN_YEAR) + 1) as Month;
};

// Day

export type DaysInYear = 365 | 366;

export const DAYS_IN_YEAR_WITHOUT_LEAP_DAY = 365;

// DAYS_IN_YEAR_WITHOUT_LEAP_DAY + 1/4 - 1/100 + 1/400
export const DAYS_IN_YEAR_AVERAGE = 365.2425;

export const daysInYear = (year: number): DaysInYear => {
  return (DAYS_IN_YEAR_WITHOUT_LEAP_DAY + +isLeapYear(year)) as DaysInYear;
};

export const dayOfYear = (date: CalendarDateObject): number => {
  // date.month が
  //   1 ならば 13
  //   2 ならば 14
  //   それ以外ならば date.month
  // それに + 1 する
  const m = ((date.month + 9) % MONTHS_IN_YEAR) + 4;
  // fairfieldの公式
  // -64 === -122 + 31(1月の日数) + 28(2月の日数) - 1(dayが1から始まるため、1月1日を0とする調整)
  const dayOfYearWithoutLeapDay =
    (((m * 30.6 - 64 + date.day) | 0) % DAYS_IN_YEAR_WITHOUT_LEAP_DAY) + 1;

  const leapDay = +(date.month > 2 && isLeapYear(date.year));
  return dayOfYearWithoutLeapDay + leapDay;
};

export type DaysInMonth = 28 | 29 | 30 | 31;

// DAYS_IN_YEAR_AVERAGE / 12
export const DAYS_IN_MONTH_AVERAGE = 30.436875;

const daysInMonthArray = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const satisfies readonly DaysInMonth[];

export const daysInMonth = (year: number, month: Month): DaysInMonth => {
  return month === 2 && isLeapYear(year) ? 29 : daysInMonthArray[month - 1];
};

// biome-ignore format: table
export type DayOfMonth =
  | (   | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 9)
  | (10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19)
  | (20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29)
  | (30 | 31);

export const normalizeCalendarDate = (
  year: number,
  month: number,
  day: number,
): CalendarDateObject => {
  year += Math.floor((month - 1) / MONTHS_IN_YEAR);
  month %= MONTHS_IN_YEAR;
  if (month <= 0) month += MONTHS_IN_YEAR;

  while (day > daysInMonth(year, month as Month)) {
    day -= daysInMonth(year, month as Month);
    month++;
    if (month > MONTHS_IN_YEAR) {
      month = 1;
      year++;
    }
  }

  while (day <= 0) {
    month--;
    if (month < 1) {
      month = MONTHS_IN_YEAR;
      year--;
    }
    day += daysInMonth(year, month as Month);
  }

  return {
    year,
    month: month as Month,
    day,
  };
};
