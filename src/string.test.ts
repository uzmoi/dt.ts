import { describe, expect, test } from "@jest/globals";
import type { DateObject, TimeObject } from "./datetime";
import { Weekday } from "./number";
import { dateToString, timeToString, weekdayString } from "./string";

describe("dateToString", () => {
  test("basic", () => {
    const date: DateObject = {
      year: 95,
      month: 8,
      day: 4,
    };
    expect(dateToString(date, "basic")).toBe("00950804");
  });
  test("extended", () => {
    const date: DateObject = {
      year: 95,
      month: 8,
      day: 4,
    };
    expect(dateToString(date)).toBe("0095-08-04");
  });
});

describe("timeToString", () => {
  test("basic", () => {
    const time: TimeObject = {
      hour: 16,
      minute: 8,
      second: 4,
      millisecond: 2,
    };
    expect(timeToString(time, "basic")).toBe("160804.002");
  });
  test("extended", () => {
    const time: TimeObject = {
      hour: 16,
      minute: 8,
      second: 4,
      millisecond: 2,
    };
    expect(timeToString(time)).toBe("16:08:04.002");
  });
});

test("weekdayString", () => {
  expect(weekdayString(Weekday.Mon)).toBe("Mon");
});
