import { formatInt } from "./string/utils.ts";
import type { Strict } from "./types.ts";

export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_MINUTE = 60;
export const MILLISECONDS_IN_SECOND = 1000;

export interface TimeObject {
  hour: Hour | (number & {});
  minute: Minute | (number & {});
  second: Second | (number & {});
  millisecond: number;
}

// biome-ignore format: table
export type Hour =
  | ( 0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9 | 10 | 11)
  | (12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23);

// biome-ignore format: table
export type Minute =
  | ( 0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9)
  | (10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19)
  | (20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29)
  | (30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39)
  | (40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49)
  | (50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59);

// biome-ignore format: table
export type Second =
  | ( 0 |  1 |  2 |  3 |  4 |  5 |  6 |  7 |  8 |  9)
  | (10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19)
  | (20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29)
  | (30 | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39)
  | (40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49)
  | (50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59)
  | 60; // <- leap second

export const timeToMilliseconds = (time: TimeObject): number => {
  const minutes = time.hour * MINUTES_IN_HOUR + time.minute;
  const seconds = minutes * SECONDS_IN_MINUTE + time.second;
  return seconds * MILLISECONDS_IN_SECOND + time.millisecond;
};

export const formatTime = (
  time: TimeObject,
  format?: "extended" | "basic",
): string => {
  return [
    formatInt(time.hour, 2),
    formatInt(time.minute, 2),
    formatInt(time.second, 2) +
      String(time.millisecond / MILLISECONDS_IN_SECOND).slice(1),
  ].join(format === "basic" ? "" : ":");
};

const timeRe = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/;

export class Time implements Strict<TimeObject> {
  static parse(time: string): Time | null {
    const result = timeRe.exec(time);
    if (result == null) return null;
    // biome-ignore lint/style/noNonNullAssertion: timeReから自明
    return new Time(+result[1]!, +result[2]!, +result[3]!, +result[4]!);
  }

  constructor(
    readonly hour: Hour = 0,
    readonly minute: Minute = 0,
    readonly second: Second = 0,
    readonly millisecond = 0,
  ) {}

  with(time: Partial<Strict<TimeObject>>): Time {
    return new Time(
      time.hour ?? this.hour,
      time.minute ?? this.minute,
      time.second ?? this.second,
      time.millisecond ?? this.millisecond,
    );
  }

  toString(format?: "extended" | "basic"): string {
    return formatTime(this, format);
  }
}
