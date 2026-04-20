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
  type Hour,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  type Minute,
  SECONDS_IN_MINUTE,
  type Second,
} from "../time.ts";
import type { Strict } from "../types.ts";
import { formatOffset, parseOffset } from "./offset.ts";

// https://www.rfc-editor.org/info/rfc3339

const RFC3339RegExp =
  /^(\d{4})-(\d\d)-(\d\d)[T ](\d\d):(\d\d):(\d\d)(\.\d+)?(Z|[+-]\d\d:\d\d)$/i;

type RFC3339RegExpExecArray = [
  match: string,
  year: string,
  month: string,
  day: string,
  hour: string,
  minute: string,
  second: string,
  second_fraction: string | undefined,
  offset: string,
];

export const parseRFC3339 = (
  dt: string,
): Strict<OffsetDateTimeObject> | null => {
  const matchResult = RFC3339RegExp.exec(dt) as RFC3339RegExpExecArray | null;
  if (matchResult == null) return null;

  const year = +matchResult[1];
  const month = +matchResult[2];
  const day = +matchResult[3];
  const hour = +matchResult[4];
  const minute = +matchResult[5];
  const second = +matchResult[6];
  const millisecond = +(matchResult[7] || 0) * MILLISECONDS_IN_SECOND;

  const offset = parseOffset(matchResult[8], { allowLowerCase: true });

  // if文はminifyで折りたたんでもらう。

  if (offset == null) return null;

  // 01-12
  if (month === 0 || month > MONTHS_IN_YEAR) return null;

  // 01-28, 01-29, 01-31, 01-31
  if (day === 0 || day > getDaysInMonth(year, month as Month)) return null;

  // 00-23
  if (hour >= HOURS_IN_DAY) return null;

  // 00-59
  if (minute >= MINUTES_IN_HOUR) return null;

  // 00-60
  // 正の閏秒として60が許可されている。
  if (second > SECONDS_IN_MINUTE) return null;

  // 正の閏秒は必ず UTC の 23:59:60 に挿入される。
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
    hour: hour as Hour,
    minute: minute as Minute,
    second: second as Second,
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
  const date = formatDate(dt);
  const delim = options?.deliminator ?? "T";
  const time = formatTime(dt);
  const offset = formatOffset(dt.offset);
  return date + delim + time + offset;
};
