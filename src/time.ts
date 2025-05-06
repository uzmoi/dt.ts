import { formatInt } from "./string/utils.ts";

export const HOURS_IN_DAY = 24;
export const MINUTES_IN_HOUR = 60;
export const SECONDS_IN_MINUTE = 60;
export const MILLISECONDS_IN_SECOND = 1000;

export interface TimeObject {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
}

export const timeToMilliseconds = (time: TimeObject): number => {
  const minutes = time.hour * MINUTES_IN_HOUR + time.minute;
  const seconds = minutes * SECONDS_IN_MINUTE + time.second;
  return seconds * MILLISECONDS_IN_SECOND + time.millisecond;
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
    String(time.millisecond / MILLISECONDS_IN_SECOND).slice(1)
  );
};

const timeRe = /^(\d\d):(\d\d):(\d\d)(?:\.(\d+))?$/;

export class Time implements TimeObject {
  static parse(time: string): Time | null {
    const result = timeRe.exec(time);
    if (result == null) return null;
    return new Time(+result[1], +result[2], +result[3], +result[4]);
  }

  constructor(
    readonly hour = 0,
    readonly minute = 0,
    readonly second = 0,
    readonly millisecond = 0,
  ) {}

  with(time: Partial<TimeObject>): Time {
    return new Time(
      time.hour ?? this.hour,
      time.minute ?? this.minute,
      time.second ?? this.second,
      time.millisecond ?? this.millisecond,
    );
  }

  toString(format?: "extended" | "basic"): string {
    return timeToString(this, format);
  }
}
