import { assert } from "emnorst";
import { daysInMonth, MONTHS_IN_YEAR, type Month } from "./date.ts";
import { DateTime, type DateTimeLike, normalizeTime } from "./datetime.ts";
import type { DurationObject } from "./duration.ts";
import { daysBetween } from "./relative.ts";

export class Interval {
  static from(this: void, start: DateTimeLike, end: DateTimeLike): Interval {
    return new Interval(DateTime.from(start), DateTime.from(end));
  }
  static before(
    this: void,
    end: DateTimeLike,
    dur: Partial<DurationObject>,
  ): Interval {
    const endDt = DateTime.from(end);
    return new Interval(endDt.minus(dur), endDt);
  }
  static after(
    this: void,
    start: DateTimeLike,
    dur: Partial<DurationObject>,
  ): Interval {
    const startDt = DateTime.from(start);
    return new Interval(startDt, startDt.plus(dur));
  }

  constructor(
    readonly start: DateTime,
    readonly end: DateTime,
  ) {}

  toDuration(): DurationObject {
    const { start, end } = this;
    // biome-ignore format: table
    const time = normalizeTime({
      hour:        end.hour        - start.hour,
      minute:      end.minute      - start.minute,
      second:      end.second      - start.second,
      millisecond: end.millisecond - start.millisecond,
    });
    let days = end.day - start.day + time.day;
    let months =
      (end.year - start.year) * MONTHS_IN_YEAR + end.month - start.month;

    const daysInCurrentMonth = () => {
      const m = start.month + months;
      return daysInMonth(
        start.year + Math.floor(m / MONTHS_IN_YEAR),
        (m % MONTHS_IN_YEAR || MONTHS_IN_YEAR) as Month,
      );
    };

    while (days > daysInCurrentMonth()) {
      days -= daysInCurrentMonth();
      months++;
    }
    while (days < 0) {
      months--;
      days += daysInCurrentMonth();
    }

    // biome-ignore format: table
    return {
      years:        Math.floor(months / MONTHS_IN_YEAR),
      months:       months % MONTHS_IN_YEAR,
      days:         days,
      hours:        time.hour,
      minutes:      time.minute,
      seconds:      time.second,
      milliseconds: time.millisecond,
    };
  }
  to(this: Interval, key: keyof DurationObject): number {
    if (key === "years") {
      return this.years;
    }
    if (key === "months") {
      return this.years * MONTHS_IN_YEAR + this.months;
    }
    const days = daysBetween(this.start, this.end);
    if (key === "days") {
      return days;
    }
    const hours = days * HOURS_IN_DAY + this.hours;
    if (key === "hours") {
      return hours;
    }
    const minutes = hours * MINUTES_IN_HOUR + this.minutes;
    if (key === "minutes") {
      return minutes;
    }
    const seconds = minutes * SECONDS_IN_MINUTE + this.seconds;
    if (key === "seconds") {
      return seconds;
    }
    if (key === "milliseconds") {
      return seconds * MILLIS_IN_SECOND + this.milliseconds;
    }
    assert.unreachable<typeof key>();
  }
  contains(this: Interval, dt: DateTime): boolean {
    return this.start <= dt && dt <= this.end;
  }
  overlaps(this: Interval, i: Interval): boolean {
    return this.start <= i.end && i.start <= this.end;
  }
}
