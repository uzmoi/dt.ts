import {
  type DayOfMonth,
  formatDate,
  getDaysInMonth,
  MONTHS_IN_YEAR,
  type Month,
} from "../date.ts";
import type { OffsetDateTimeObject } from "../datetime.ts";
import {
  formatTime,
  HOURS_IN_DAY,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from "../time.ts";
import { formatOffset, parseOffset } from "./offset.ts";

// https://www.rfc-editor.org/info/rfc3339

const RFC3339Re =
  /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)((?:\.\d+)?)(Z|[+-]\d\d:\d\d)$/i;

export const parseRFC3339 = (dt: string): OffsetDateTimeObject | null => {
  const matchResult = RFC3339Re.exec(dt);
  if (matchResult == null) return null;

  // biome-ignore-start lint/style/noNonNullAssertion: RFC3339Reから自明。
  // 0000-9999
  const year = +matchResult[1]!;

  // 01-12
  const month = +matchResult[2]!;
  if (month === 0 || month > MONTHS_IN_YEAR) return null;

  // 01-28, 01-29, 01-31, 01-31
  const day = +matchResult[3]!;
  if (day === 0 || day > getDaysInMonth(year, month as Month)) return null;

  // 00-23
  const hour = +matchResult[4]!;
  if (hour >= HOURS_IN_DAY) return null;

  // 00-59
  const minute = +matchResult[5]!;
  if (minute >= MINUTES_IN_HOUR) return null;

  // 00-60
  // 正の閏秒として60が許可されている。
  const second = +matchResult[6]!;
  if (second > SECONDS_IN_MINUTE) {
    return null;
  }

  const ms = matchResult[7]!.slice(1, 4).padEnd(3, "0");
  const millisecond = +`${ms}.${matchResult[7]!.slice(4)}`;

  const offset = parseOffset(matchResult[8]!, { allowLowerCase: true });
  // biome-ignore-end lint/style/noNonNullAssertion: RFC3339Reから自明。
  if (offset == null) return null;

  // 閏秒は必ず UTC の 23:59:60 に挿入される。
  if (second === 60) {
    const t =
      (hour * MINUTES_IN_HOUR + minute - offset + 1) %
      (HOURS_IN_DAY * MINUTES_IN_HOUR);
    if (t !== 0) return null;
  }

  return {
    year,
    month: month as Month,
    day: day as DayOfMonth,
    hour,
    minute,
    second,
    millisecond,
    offset,
  };
};

export interface RFC3339FormatOptions {
  /** @default "T" */
  deliminator?: string;
}

export const formatRFC3339 = (
  dt: OffsetDateTimeObject,
  options?: RFC3339FormatOptions,
): string => {
  const delim = options?.deliminator ?? "T";
  return formatDate(dt) + delim + formatTime(dt) + formatOffset(dt.offset);
};
