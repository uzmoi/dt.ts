import type { DateObject } from "./datetime";
import { dayOfYear, daysInYearWithoutLeapDay, leapDays } from "./number";

export const daysBetween = (start: DateObject, end: DateObject): number => {
  return (
    (end.year - start.year) * daysInYearWithoutLeapDay +
    (leapDays(end.year) - leapDays(start.year)) +
    (dayOfYear(end) - dayOfYear(start))
  );
};
