import { describe, expect, test } from "vitest";
import { DateTime } from "./datetime.ts";
import { isLeapYear } from "./number.ts";

describe("DateTime", () => {
  test("from DateTime class", () => {
    const dt = DateTime.now();
    expect(DateTime.from(dt)).toBe(dt);
  });
  test("fromTuple", () => {
    const dt = DateTime.fromTuple([2023, 4, 15, 22, 45, 12, 123]);
    expect(dt.toString()).toBe("2023-04-15T22:45:12.123");
  });
  test("from millisecond", () => {
    const date = new Date();
    expect(DateTime.fromMillis(date.getTime())).toStrictEqual(
      DateTime.fromNativeDate(date),
    );
  });
  test("default is unix epoch", () => {
    const dt = DateTime.fromObject({});
    expect(dt.toString() + "Z").toBe(new Date(0).toISOString());
  });
  test(".toString()", () => {
    const dt = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(dt.toString()).toBe("2022-11-07T01:23:45.678");
  });
  test("JSON", () => {
    const dt = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(JSON.stringify(dt)).toBe(JSON.stringify("2022-11-07T01:23:45.678"));
  });
  test.each([
    ["year" as const,   "2022-01-01T00:00:00.000Z"], // prettier-ignore
    ["month" as const,  "2022-11-01T00:00:00.000Z"], // prettier-ignore
    ["day" as const,    "2022-11-07T00:00:00.000Z"], // prettier-ignore
    ["hour" as const,   "2022-11-07T01:00:00.000Z"], // prettier-ignore
    ["minute" as const, "2022-11-07T01:23:00.000Z"], // prettier-ignore
    ["second" as const, "2022-11-07T01:23:45.000Z"], // prettier-ignore
    ["week" as const,   "2022-11-06T00:00:00.000Z"], // prettier-ignore
  ])(".startOf('%s')", (key, expected) => {
    const base = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(base.startOf(key)).toStrictEqual(DateTime.from(expected));
  });
  test.each([
    ["year" as const,   "2022-12-31T23:59:59.999Z"], // prettier-ignore
    ["month" as const,  "2022-11-30T23:59:59.999Z"], // prettier-ignore
    ["day" as const,    "2022-11-07T23:59:59.999Z"], // prettier-ignore
    ["hour" as const,   "2022-11-07T01:59:59.999Z"], // prettier-ignore
    ["minute" as const, "2022-11-07T01:23:59.999Z"], // prettier-ignore
    ["second" as const, "2022-11-07T01:23:45.999Z"], // prettier-ignore
    ["week" as const,   "2022-11-12T23:59:59.999Z"], // prettier-ignore
  ])(".endOf('%s')", (key, expected) => {
    const base = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(base.endOf(key)).toStrictEqual(DateTime.from(expected));
  });
});

describe("plus", () => {
  test("plus", () => {
    const dt = DateTime.from([2022]).plus({
      months: 10,
      days: 6,
      hours: 1,
      minutes: 23,
      seconds: 45,
      milliseconds: 678,
    });

    expect(dt).toEqual(DateTime.from("2022-11-07T01:23:45.678Z"));
  });

  test("うるう日の1年後", () => {
    const dt = DateTime.from([2020, 2, 29]);
    expect(dt.isInLeapYear()).toBe(true);
    expect(dt.plus({ years: 1 }).toString()).toBe("2021-03-01T00:00:00.000");
  });

  test("plus order", () => {
    const base = DateTime.from([2022]);
    expect(isLeapYear(2024)).toBe(true);
    expect(base.plus({ years: 2, days: 60 })).toEqual(
      base.plus({ years: 2 }).plus({ days: 60 }),
    );
  });
});
