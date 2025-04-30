import type { Weekday } from "../number";
import type { Head3 } from "./utils";

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
