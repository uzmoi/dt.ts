import { describe, expect, test } from "vitest";
import {
  DAYS_IN_YEAR_WITHOUT_LEAP_DAY,
  daysInMonth,
  MONTHS_IN_YEAR,
  type Month,
} from "./date.ts";
import { DateTime } from "./datetime.ts";
import type { DurationObject } from "./duration.ts";
import { Interval } from "./interval.ts";
import {
  HOURS_IN_DAY,
  MILLISECONDS_IN_SECOND,
  MINUTES_IN_HOUR,
  SECONDS_IN_MINUTE,
} from "./time.ts";

describe("Interval", () => {
  /** biome-ignore-start lint/suspicious/noSkippedTests: 実装できてないというか、I/Fすら決まってない */
  // biome-ignore format: table
  const plus: DurationObject = {
    years:        1,
    months:       2,
    days:         26,
    hours:        6,
    minutes:      33,
    seconds:      4,
    milliseconds: 999,
  };
  const start = DateTime.from("2022-11-07T01:23:45.678Z");
  test.skip.each<DurationObject>([
    plus,
    // biome-ignore format: table
    { years: 2, months: 1, days: 30, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
    // biome-ignore format: table
    { years: 5, months: 2, days: 27, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
    // biome-ignore format: table
    { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, milliseconds: 0 },
  ])("new %j", dur => {
    expect(Interval.after(start, dur)).toMatchObject({ ...dur });
  });
  test.skip(".to('years')", () => {
    const interval = Interval.after(start, { years: 1 });
    expect(interval.to("years")).toBe(1);
  });
  test.skip(".to('months')", () => {
    const interval = Interval.after(start, { years: 1, months: 2 });
    expect(interval.to("months")).toBe(1 * MONTHS_IN_YEAR + 2);
  });
  test.skip(".to('milliseconds')", () => {
    // biome-ignore format: 可読性
    const expectedDays = plus.years * DAYS_IN_YEAR_WITHOUT_LEAP_DAY
      + daysInMonth(start.year + plus.years, start.month + 1 as Month)
      + daysInMonth(start.year + plus.years + 1, (start.month + 2) % MONTHS_IN_YEAR as Month)
      + plus.days;
    const expected = [
      [HOURS_IN_DAY, plus.hours],
      [MINUTES_IN_HOUR, plus.minutes],
      [SECONDS_IN_MINUTE, plus.seconds],
      [MILLISECONDS_IN_SECOND, plus.milliseconds],
    ].reduce((prev, [rate, value]) => prev * rate + value, expectedDays);
    const interval = Interval.after(start, plus);
    expect(interval.to("milliseconds")).toBe(expected);
  });
  test.skip("(unixEpoch..now).to('milliseconds') === Date.now()", () => {
    const now = Date.now();
    const interval = Interval.from("1970-01-01T00:00:00.000Z", now);
    expect(interval.to("milliseconds")).toBe(now);
  });
  /** biome-ignore-end  lint/suspicious/noSkippedTests: おわり。 */

  test.todo("contains");

  test("overlaps", () => {
    const a = Interval.after({ year: 2000 }, { years: 20 });
    const b = Interval.after({ year: 2010 }, { years: 20 });
    expect(a.overlaps(b)).toBe(true);
    expect(b.overlaps(a)).toBe(true);
  });
});
