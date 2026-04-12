import {
  type CalendarDateObject,
  DAYS_IN_YEAR_WITHOUT_LEAP_DAY,
  getDayOfYear,
  leapDays,
} from "./date.ts";

export const daysBetween = (
  start: CalendarDateObject,
  end: CalendarDateObject,
): number => {
  return (
    (end.year - start.year) * DAYS_IN_YEAR_WITHOUT_LEAP_DAY +
    (leapDays(end.year) - leapDays(start.year)) +
    (getDayOfYear(end) - getDayOfYear(start))
  );
};
