import type { DateObject } from "./datetime.ts";

// Leap

export const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

export const leapDays = (year: number): number => {
  return ((year / 4) | 0) - ((year / 100) | 0) + ((year / 400) | 0);
};

// Month

export const MONTHS_IN_YEAR = 12;

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Day

export type DaysInYear = 365 | 366;

export const DAYS_IN_YEAR_WITHOUT_LEAP_DAY = 365;

// DAYS_IN_YEAR_WITHOUT_LEAP_DAY + 1/4 - 1/100 + 1/400
export const DAYS_IN_YEAR_AVERAGE = 365.2425;

export const daysInYear = (year: number): DaysInYear => {
  return (DAYS_IN_YEAR_WITHOUT_LEAP_DAY + +isLeapYear(year)) as DaysInYear;
};

export const dayOfYear = (date: DateObject): number => {
  // date.month が
  //   1 ならば 13
  //   2 ならば 14
  //   それ以外ならば date.month
  // それに + 1 する
  const m = ((date.month + 9) % MONTHS_IN_YEAR) + 4;
  // fairfieldの公式
  // -64 === -122 + 31(1月の日数) + 28(2月の日数) - 1(dayが1から始まるため、1月1日を0とする調整)
  const dayOfYearWithoutLeapDay =
    ((((306 * m) / 10) | 0) - 64 + date.day) % DAYS_IN_YEAR_WITHOUT_LEAP_DAY;

  const leapDay = +(date.month > 2 && isLeapYear(date.year));
  return dayOfYearWithoutLeapDay + leapDay;
};

export type DaysInMonth = 28 | 29 | 30 | 31;

// daysInYearAverage / 12
export const DAYS_IN_MONTH_AVERAGE = 30.436875;

const daysInMonthArray = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const satisfies readonly DaysInMonth[];

export const daysInMonth = (year: number, month: Month): DaysInMonth => {
  return month === 2 && isLeapYear(year) ? 29 : daysInMonthArray[month - 1];
};

// Time

export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_MINUTE = 60;
export const MILLIS_IN_SECOND = 1000;
