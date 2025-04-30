import type { Head3 } from "./utils";

const monthStringArray = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type MonthStringLong = (typeof monthStringArray)[number];
export type MonthStringShort = Head3<MonthStringLong>;

export const monthStringLong = (month: number): MonthStringLong => {
  return monthStringArray[month - 1];
};

export const monthStringShort = (month: number): MonthStringShort => {
  return monthStringArray[month - 1].slice(0, 3) as MonthStringShort;
};
