import { modulo } from "emnorst";
import {
  dayOfYear,
  daysInMonth,
  formatDate,
  isLeapYear,
  MONTHS_IN_YEAR,
  type Month,
} from "./date.ts";
import type { DurationObject } from "./duration.ts";
import {
  formatTime,
  HOURS_IN_DAY,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
  type TimeObject,
} from "./time.ts";
import {
  DAYS_IN_WEEK,
  dayOfWeek,
  type Weekday,
  type WeekOfMonth,
  weekOfMonth,
  weekOfYear,
} from "./week.ts";

export type DateObject = {
  year: number;
  month: number;
  day: number;
};

export const normalizeDate = (date: DateObject): DateObject => {
  let day = date.day;
  let month = modulo(date.month, MONTHS_IN_YEAR) || MONTHS_IN_YEAR;
  let year = date.year + Math.floor((date.month - 1) / MONTHS_IN_YEAR);
  while (day > daysInMonth(year, month as Month)) {
    day -= daysInMonth(year, month as Month);
    month++;
    if (month > MONTHS_IN_YEAR) {
      month = 1;
      year++;
    }
  }
  while (day <= 0) {
    month--;
    if (month < 1) {
      month = MONTHS_IN_YEAR;
      year--;
    }
    day += daysInMonth(year, month as Month);
  }
  return { day, month, year };
};

export const normalizeTime = (
  time: TimeObject,
): TimeObject & { day: number } => {
  const millisecond = time.millisecond;
  const second = time.second + Math.floor(millisecond / MILLISECONDS_IN_SECOND);
  const minute = time.minute + Math.floor(second / SECONDS_IN_MINUTE);
  const hour = time.hour + Math.floor(minute / MINUTES_IN_HOUR);
  return {
    day: Math.floor(hour / HOURS_IN_DAY),
    hour: modulo(hour, HOURS_IN_DAY),
    minute: modulo(minute, MINUTES_IN_HOUR),
    second: modulo(second, SECONDS_IN_MINUTE),
    millisecond: modulo(millisecond, MILLISECONDS_IN_SECOND),
  };
};

export interface DateTimeObject extends DateObject, TimeObject {}

const normalizedDateTimeFrom = (
  get: (key: keyof DateTimeObject) => number,
): DateTime => {
  // biome-ignore format: table
  const time = normalizeTime({
    hour:        get("hour"),
    minute:      get("minute"),
    second:      get("second"),
    millisecond: get("millisecond"),
  });
  // biome-ignore format: table
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

// biome-ignore format: table
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

// biome-ignore format: table
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
    return `${formatDate(this)}T${formatTime(this)}`;
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
    // biome-ignore lint/suspicious/noConfusingLabels: 他にどうしろってんだ。
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
      return start.plus({ days: DAYS_IN_WEEK, milliseconds: -1 });
    } else {
      return start.plus({ [`${key}s`]: 1, milliseconds: -1 });
    }
  }
}

type DurationUnit = Exclude<keyof DateTimeObject, "millisecond"> | "week";
