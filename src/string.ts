import type { DateObject, TimeObject } from "./datetime";
import { formatInt } from "./string/utils";

export const dateToString = (
  date: DateObject,
  format?: "extended" | "basic",
): string => {
  const delim = format === "basic" ? "" : "-";
  return (
    formatInt(date.year, 4) +
    delim +
    formatInt(date.month, 2) +
    delim +
    formatInt(date.day, 2)
  );
};

export const timeToString = (
  time: TimeObject,
  format?: "extended" | "basic",
): string => {
  const delim = format === "basic" ? "" : ":";
  return (
    formatInt(time.hour, 2) +
    delim +
    formatInt(time.minute, 2) +
    delim +
    formatInt(time.second, 2) +
    "." +
    formatInt(time.millisecond, 3)
  );
};
