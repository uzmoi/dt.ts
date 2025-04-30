import { modulo } from "emnorst";
import type { DurationObject } from "./duration";
import {
  dayOfWeek,
  dayOfYear,
  daysInMonth,
  daysInWeek,
  hoursInDay,
  isLeapYear,
  millisInSecond,
  minutesInHour,
  monthsInYear,
  secondsInMinute,
  weekOfMonth,
  weekOfYear,
  type Month,
  type WeekOfMonth,
  type Weekday,
} from "./number";
import { dateToString, timeToString } from "./string";

export type DateObject = {
  year: number;
  month: number;
  day: number;
};

export const normalizeDate = (date: DateObject): DateObject => {
  let day = date.day;
  let month = modulo(date.month, monthsInYear) || monthsInYear;
  let year = date.year + Math.floor((date.month - 1) / monthsInYear);
  while (day > daysInMonth(year, month as Month)) {
    day -= daysInMonth(year, month as Month);
    month++;
    if (month > monthsInYear) {
      month = 1;
      year++;
    }
  }
  while (day <= 0) {
    month--;
    if (month < 1) {
      month = monthsInYear;
      year--;
    }
    day += daysInMonth(year, month as Month);
  }
  return { day, month, year };
};

export type TimeObject = {
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
};

export const normalizeTime = (
  time: TimeObject,
): TimeObject & { day: number } => {
  const millisecond = time.millisecond;
  const second = time.second + Math.floor(millisecond / millisInSecond);
  const minute = time.minute + Math.floor(second / secondsInMinute);
  const hour = time.hour + Math.floor(minute / minutesInHour);
  return {
    day: Math.floor(hour / hoursInDay),
    hour: modulo(hour, hoursInDay),
    minute: modulo(minute, minutesInHour),
    second: modulo(second, secondsInMinute),
    millisecond: modulo(millisecond, millisInSecond),
  };
};

export interface DateTimeObject extends DateObject, TimeObject {}

const normalizedDateTimeFrom = (
  get: (key: keyof DateTimeObject) => number,
): DateTime => {
  // prettier-ignore
  const time = normalizeTime({
    hour:        get("hour"),
    minute:      get("minute"),
    second:      get("second"),
    millisecond: get("millisecond"),
  });
  // prettier-ignore
  const date = normalizeDate({
    day:   get("day") + time.day,
    month: get("month"),
    year:  get("year"),
  });
  // @ts-expect-error
  return new DateTime(
    date.year,
    date.month,
    date.day,
    time.hour,
    time.minute,
    time.second,
    time.millisecond,
  );
};

// prettier-ignore
export type DateTimeTuple = [
  year?:        number,
  month?:       number,
  day?:         number,
  hour?:        number,
  minute?:      number,
  second?:      number,
  millisecond?: number,
];

export type DateTimeLike =
  | Partial<DateTimeObject>
  | DateTimeTuple
  | string
  | number
  | Date;

// prettier-ignore
const dateTimeDefaults: DateTimeObject = {
  year:        1970,
  month:       1,
  day:         1,
  hour:        0,
  minute:      0,
  second:      0,
  millisecond: 0,
};

export const dateTimeUnits = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
  "millisecond",
] as const satisfies readonly (keyof DateTimeObject)[];

export class DateTime implements DateTimeObject {
  static now(this: void): DateTime {
    return DateTime.fromMillis(Date.now());
  }
  static from(this: void, source: DateTimeLike): DateTime {
    if (source instanceof DateTime) {
      return source;
    }
    if (typeof source === "number") {
      return DateTime.fromMillis(source);
    }
    if (typeof source === "string") {
      return DateTime.fromString(source);
    }
    if (source instanceof Date) {
      return DateTime.fromNativeDate(source);
    }
    if (Array.isArray(source)) {
      return DateTime.fromTuple(source);
    }
    return DateTime.fromObject(source);
  }
  static fromNativeDate(this: void, nativeDate: Date): DateTime {
    return new DateTime(
      nativeDate.getUTCFullYear(),
      nativeDate.getUTCMonth() + 1,
      nativeDate.getUTCDate(),
      nativeDate.getUTCHours(),
      nativeDate.getUTCMinutes(),
      nativeDate.getUTCSeconds(),
      nativeDate.getUTCMilliseconds(),
    );
  }
  static fromString(this: void, string: string): DateTime {
    return DateTime.fromNativeDate(new Date(string));
  }
  static fromMillis(this: void, ms: number): DateTime {
    return DateTime.fromObject({ millisecond: ms });
  }
  static fromTuple(this: void, tuple: DateTimeTuple): DateTime {
    const dateTimeObject: Partial<DateTimeObject> = {};
    dateTimeUnits.forEach((unit, i) => {
      dateTimeObject[unit] = tuple[i];
    });
    return DateTime.fromObject(dateTimeObject);
  }
  static fromObject<T extends Partial<DateTimeObject>>(
    this: void,
    dtObject: [unknown] extends [T extends DateTime ? unknown : never]
      ? never
      : T,
  ) {
    return normalizedDateTimeFrom(
      key => dtObject[key] ?? dateTimeDefaults[key],
    );
  }

  private constructor(
    readonly year: number,
    readonly month: number,
    readonly day: number,
    readonly hour: number,
    readonly minute: number,
    readonly second: number,
    readonly millisecond: number,
  ) {}

  isInLeapYear(): boolean {
    return isLeapYear(this.year);
  }

  /**
   * @returns 1..53
   */
  weekOfYear(weekStart: Weekday): number {
    return weekOfYear(this, weekStart);
  }
  /**
   * @returns 1..6
   */
  weekOfMonth(weekStart: Weekday): WeekOfMonth {
    return weekOfMonth(this, weekStart);
  }
  /**
   * ordinal day
   * @returns 1..366
   */
  dayOfYear(): number {
    return dayOfYear(this);
  }
  /**
   * week day
   */
  dayOfWeek(): Weekday {
    return dayOfWeek(this);
  }

  /**
   * @returns "YYYY-MM-DDThh:mm:ss.nnn"
   */
  toString(this: this): string {
    return dateToString(this) + "T" + timeToString(this);
  }
  toJSON(this: this): string {
    return this.toString();
  }
  valueOf(this: this): number {
    return Date.UTC(
      this.year,
      this.month - 1,
      this.day,
      this.hour,
      this.minute,
      this.second,
      this.millisecond,
    );
  }
  with(this: DateTime, dt: Partial<DateTimeObject>): DateTime {
    return normalizedDateTimeFrom(key => dt[key] ?? this[key]);
  }
  plus(this: DateTime, dur: Partial<DurationObject>): DateTime {
    return normalizedDateTimeFrom(key => this[key] + (dur[`${key}s`] ?? 0));
  }
  minus(this: DateTime, dur: Partial<DurationObject>): DateTime {
    return normalizedDateTimeFrom(key => this[key] - (dur[`${key}s`] ?? 0));
  }
  startOf(this: DateTime, key: DurationUnit): DateTime {
    const dt: Partial<DateTimeObject> = { millisecond: 0 };
    if (key === "week") {
      dt.day = this.day - this.dayOfWeek();
      key = "day";
    }
    block: {
      if (key === "second") break block;
      dt.second = 0;
      if (key === "minute") break block;
      dt.minute = 0;
      if (key === "hour") break block;
      dt.hour = 0;
      if (key === "day") break block;
      dt.day = 1;
      if (key === "month") break block;
      dt.month = 1;
    }
    return this.with(dt);
  }
  endOf(this: DateTime, key: DurationUnit): DateTime {
    const start = this.startOf(key);
    if (key === "week") {
      return start.plus({ days: daysInWeek, milliseconds: -1 });
    } else {
      return start.plus({ [key + "s"]: 1, milliseconds: -1 });
    }
  }
}

type DurationUnit = Exclude<keyof DateTimeObject, "millisecond"> | "week";
