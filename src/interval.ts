import { assert } from "emnorst";
import { DateTime, normalizeTime, type DateTimeLike } from "./datetime";
import type { DurationObject } from "./duration";
import {
    daysInMonth,
    hoursInDay,
    millisInSecond,
    minutesInHour,
    monthsInYear,
    secondsInMinute,
} from "./number";
import { daysBetween } from "./relative";

export class Interval implements DurationObject {
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
  readonly years: number;
  readonly months: number;
  readonly days: number;
  readonly hours: number;
  readonly minutes: number;
  readonly seconds: number;
  readonly milliseconds: number;
  constructor(readonly start: DateTime, readonly end: DateTime) {
    // prettier-ignore
    const time = normalizeTime({
      hour:        end.hour        - start.hour,
      minute:      end.minute      - start.minute,
      second:      end.second      - start.second,
      millisecond: end.millisecond - start.millisecond,
    });
    let days = end.day - start.day + time.day;
    let months =
      (end.year - start.year) * monthsInYear + end.month - start.month;

    const daysInCurrentMonth = () => {
      const m = start.month + months;
      return daysInMonth(
        start.year + Math.floor(m / monthsInYear),
        m % monthsInYear || monthsInYear,
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
    this.years        = Math.floor(months / monthsInYear); // prettier-ignore
    this.months       = months % monthsInYear; // prettier-ignore
    this.days         = days; // prettier-ignore
    this.hours        = time.hour; // prettier-ignore
    this.minutes      = time.minute; // prettier-ignore
    this.seconds      = time.second; // prettier-ignore
    this.milliseconds = time.millisecond; // prettier-ignore
  }
  to(this: Interval, key: keyof DurationObject): number {
    if (key === "years") {
      return this.years;
    }
    if (key === "months") {
      return this.years * monthsInYear + this.months;
    }
    const days = daysBetween(this.start, this.end);
    if (key === "days") {
      return days;
    }
    const hours = days * hoursInDay + this.hours;
    if (key === "hours") {
      return hours;
    }
    const minutes = hours * minutesInHour + this.minutes;
    if (key === "minutes") {
      return minutes;
    }
    const seconds = minutes * secondsInMinute + this.seconds;
    if (key === "seconds") {
      return seconds;
    }
    if (key === "milliseconds") {
      return seconds * millisInSecond + this.milliseconds;
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
