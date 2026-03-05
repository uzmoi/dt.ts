import { DAYS_IN_YEAR_WITHOUT_LEAP_DAY, dayOfYear, leapDays } from "./date.ts";
import type { DateObject } from "./datetime.ts";

export const daysBetween = (start: DateObject, end: DateObject): number => {
  return (
    (end.year - start.year) * DAYS_IN_YEAR_WITHOUT_LEAP_DAY +
    (leapDays(end.year) - leapDays(start.year)) +
    (dayOfYear(end) - dayOfYear(start))
  );
};
