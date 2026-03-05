import type { Month } from "../date.ts";
import type { Head3 } from "./utils.ts";

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

export const monthStringLong = (month: Month): MonthStringLong => {
  return monthStringArray[month - 1];
};

export const monthStringShort = (month: Month): MonthStringShort => {
  return monthStringArray[month - 1].slice(0, 3) as MonthStringShort;
};
