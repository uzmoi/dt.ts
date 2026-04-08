import { daysInMonth, MONTHS_IN_YEAR, type Month } from "./date.ts";
import {
  DateTime,
  type DateTimeLike,
  normalizeTimeObject,
} from "./datetime.ts";
import type { DurationObject } from "./duration.ts";

export class Interval {
  static from(start: DateTimeLike, end: DateTimeLike): Interval {
    return new Interval(DateTime.from(start), DateTime.from(end));
  }

  static before(end: DateTimeLike, dur: Partial<DurationObject>): Interval {
    const endDt = DateTime.from(end);
    return new Interval(endDt.minus(dur), endDt);
  }

  static after(start: DateTimeLike, dur: Partial<DurationObject>): Interval {
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
    const time = normalizeTimeObject({
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

  contains(this: Interval, dt: DateTime): boolean {
    return this.start <= dt && dt <= this.end;
  }

  overlaps(this: Interval, i: Interval): boolean {
    return this.start <= i.end && i.start <= this.end;
  }
}
