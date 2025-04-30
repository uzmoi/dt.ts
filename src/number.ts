import { modulo } from "emnorst";
import type { DateObject } from "./datetime";
import type { WeekdayStringShort } from "./string/week";

// Leap

export const isLeapYear = (year: number): boolean => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};

export const leapDays = (year: number): number => {
  return ((year / 4) | 0) - ((year / 100) | 0) + ((year / 400) | 0);
};

// Month

export const monthsInYear = 12;

// Week

export type WeeksInYear = 52 | 53;

export const weeksInYear = (
  year: number,
  weekStart = weekStartDefault,
): WeeksInYear => {
  const weekday = modulo(year + leapDays(year - 1) - weekStart + 1, daysInWeek);
  return weekday === 0 && isLeapYear(year) ? 53 : 52;
};

/**
 * @returns 1..53
 */
export const weekOfYear = (
  date: DateObject,
  weekStart = weekStartDefault,
): number => {
  const weekdayOffset = dayOfWeek({
    year: date.year,
    month: 1,
    day: 1 + daysInWeek - weekStart,
  });
  return Math.floor((weekdayOffset + dayOfYear(date)) / daysInWeek);
};

export type WeeksInMonth = 4 | 5 | 6;

export const weeksInMonth = (
  year: number,
  month: number,
  weekStart?: Weekday,
): WeeksInMonth => {
  const day = daysInMonth(year, month);
  return weekOfMonth({ year, month, day }, weekStart) as WeeksInMonth;
};

export type WeekOfMonth = 1 | 2 | 3 | 4 | 5 | 6;

export const weekOfMonth = (
  date: DateObject,
  weekStart = weekStartDefault,
): WeekOfMonth => {
  const weekdayOffset = dayOfWeek({
    year: date.year,
    month: date.month,
    day: 1 + daysInWeek - weekStart,
  });
  return Math.ceil((weekdayOffset + date.day) / daysInWeek) as WeekOfMonth;
};

// Day

export type DaysInYear = 365 | 366;

export const daysInYearWithoutLeapDay = 365;

// daysInYearWithoutLeapDay + 1/4 - 1/100 + 1/400
export const daysInYearAverage = 365.2425;

export const daysInYear = (year: number): DaysInYear => {
  return (daysInYearWithoutLeapDay + +isLeapYear(year)) as DaysInYear;
};

export const dayOfYear = (date: DateObject): number => {
  // date.month が
  //   1 ならば 13
  //   2 ならば 14
  //   それ以外ならば date.month
  // それに + 1 する
  const m = ((date.month + 9) % monthsInYear) + 4;
  // fairfieldの公式
  // -64 === -122 + 31(1月の日数) + 28(2月の日数) - 1(dayが1から始まるため、1月1日を0とする調整)
  const dayOfYearWithoutLeapDay =
    ((((306 * m) / 10) | 0) - 64 + date.day) % daysInYearWithoutLeapDay;

  const leapDay = +(date.month > 2 && isLeapYear(date.year));
  return dayOfYearWithoutLeapDay + leapDay;
};

export type DaysInMonth = 28 | 29 | 30 | 31;

// daysInYearAverage / 12
export const daysInMonthAverage = 30.436875;

const daysInMonthArray = [
  31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31,
] as const satisfies readonly DaysInMonth[];

export const daysInMonth = (year: number, month: number): DaysInMonth => {
  const leapDay = +(month === 2 && isLeapYear(year));
  return (daysInMonthArray[month - 1] + leapDay) as DaysInMonth;
};

export const daysInWeek = 7;

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

const weekStartDefault: Weekday = Weekday.Sun;

export const dayOfWeek = (date: DateObject): Weekday => {
  const d = date.year + leapDays(date.year - 1) + dayOfYear(date);
  return (d % daysInWeek) as Weekday;
};

// Time

export const hoursInDay = 24;
export const minutesInHour = 60;
export const secondsInMinute = 60;
export const millisInSecond = 1000;
