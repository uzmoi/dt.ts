import { daysInMonth, MONTHS_IN_YEAR, type Month } from "../date.ts";
import type { DateTimeObject } from "../datetime.ts";
import { dateToString } from "../string.ts";
import {
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
  timeToString,
} from "../time.ts";
import { formatOffset, parseOffset } from "./offset.ts";

// https://www.rfc-editor.org/info/rfc3339

const RFC3339Re =
  /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)((?:\.\d+)?)(Z|[+-]\d\d:\d\d)$/;

export const parseRFC3339 = (
  dt: string,
): (DateTimeObject & { offset: number }) | null => {
  const matchResult = RFC3339Re.exec(dt);
  if (matchResult == null) return null;

  const year = +matchResult[1];

  const month = +matchResult[2];
  if (month === 0 || month > MONTHS_IN_YEAR) return null;

  const day = +matchResult[3];
  if (day === 0 || day > daysInMonth(year, month as Month)) return null;

  const hour = +matchResult[4];
  if (hour >= HOURS_IN_DAY) return null;

  const minute = +matchResult[5];
  if (minute >= MINUTES_IN_HOUR) return null;

  const second = +matchResult[6];
  if (second >= SECONDS_IN_MINUTE) return null;

  const ms = matchResult[7].slice(1, 4).padEnd(3, "0");
  const millisecond = +`${ms}.${matchResult[7].slice(4)}`;

  const offset = parseOffset(matchResult[8], { allowLowerCase: true });
  if (offset == null) return null;

  return { year, month, day, hour, minute, second, millisecond, offset };
};

export interface RFC3339FormatOptions {
  /** @default "T" */
  deliminator?: string;
}

export const formatRFC3339 = (
  dt: DateTimeObject & { offset: number },
  options?: RFC3339FormatOptions,
): string => {
  const delim = options?.deliminator ?? "T";
  return dateToString(dt) + delim + timeToString(dt) + formatOffset(dt.offset);
};
