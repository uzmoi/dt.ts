import type { DateObject } from "./datetime.ts";
import { formatInt } from "./string/utils.ts";

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
