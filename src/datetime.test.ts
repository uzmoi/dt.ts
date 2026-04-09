import { describe, expect, test } from "vitest";
import { DateTime } from "./datetime.ts";

describe("Create DateTime", () => {
  test("from DateTime class", () => {
    const dt = DateTime.now();
    expect(DateTime.from(dt)).toBe(dt);
  });

  test("from string", () => {
    expect(DateTime.fromString("2025-07-18T19:00:01.002+09:00")).toEqual({
      year: 2025,
      month: 7,
      day: 18,
      hour: 19,
      minute: 0,
      second: 1,
      millisecond: 2,
      offset: 9 * 60,
    });
  });

  test("from object", () => {
    const object = {
      year: 2017,
      month: 3,
      day: 9,
      hour: 9,
      minute: 0,
      second: 1,
      millisecond: 2,
      offset: 9 * 60,
    } as const;
    expect(DateTime.fromObject(object)).toEqual(object);
  });

  test("default is unix epoch", () => {
    expect(DateTime.fromObject({})).toEqual(
      DateTime.from("1970-01-01T00:00:00Z"),
    );
  });

  test("from millisecond", () => {
    const date = new Date();
    expect(DateTime.fromMillis(date.getTime())).toEqual(
      DateTime.from(date.toISOString()),
    );
  });

  test("from native `Date`", () => {
    const date = new Date();
    expect(DateTime.fromNativeDate(date)).toEqual(
      DateTime.from(date.toISOString()),
    );
  });
});

describe(".valueOf()", () => {
  test("unix_epoch.valueOf() == 0", () => {
    const dt = DateTime.from("1970-01-01T00:00:00Z");
    expect(dt.valueOf()).toBe(0);
  });

  test("offset", () => {
    const dt = DateTime.from("1970-01-01T00:00:00+09:00");
    expect(dt.valueOf()).toBe(-9 * 60 * 60 * 1000);
  });
});

describe("Serialize", () => {
  test(".toString()", () => {
    const string = "2022-11-07T01:23:45.678Z";
    expect(DateTime.from(string).toString()).toBe(string);
  });

  test("JSON", () => {
    const string = "2022-11-07T01:23:45.678Z";
    expect(JSON.stringify(DateTime.from(string))).toBe(JSON.stringify(string));
  });
});

describe("compare", () => {
  describe("equals", () => {
    test("Equal to itself", () => {
      const dt = DateTime.from("1970-01-01T00:00:00+09:00");
      expect(dt.equals(dt)).toBe(true);
    });

    test("Compare after subtracting the offset", () => {
      const utc = DateTime.from("1970-01-01T00:00:00Z");
      const local = DateTime.from("1970-01-01T09:00:00+09:00");
      expect(utc.equals(local)).toBe(true);
    });

    test("Different dates and times", () => {
      const dt1 = DateTime.from("2013-09-20T00:00:00Z");
      const dt2 = DateTime.from("2016-03-31T00:00:00Z");
      expect(dt1.equals(dt2)).toBe(false);
    });

    test("Different offsets", () => {
      const dt1 = DateTime.from({ offset: 0 });
      const dt2 = DateTime.from({ offset: 9 * 60 });
      expect(dt1.equals(DateTime.from(dt2))).toBe(false);
    });
  });

  test("isBefore", () => {
    const before = DateTime.from(0);
    const after = DateTime.from(1);
    expect(before.isBefore(after)).toBe(true);
    expect(after.isBefore(before)).toBe(false);
  });

  test("Not before itself", () => {
    const dt = DateTime.now();
    expect(dt.isBefore(dt)).toBe(false);
  });

  test("isAfter", () => {
    const before = DateTime.from(0);
    const after = DateTime.from(1);
    expect(before.isAfter(after)).toBe(false);
    expect(after.isAfter(before)).toBe(true);
  });

  test("Not after itself", () => {
    const dt = DateTime.now();
    expect(dt.isAfter(dt)).toBe(false);
  });
});

test.todo("with");

describe("startOf / endOf", () => {
  test.each`
    unit        | expected
    ${"year"}   | ${"2022-01-01T00:00:00.000Z"}
    ${"month"}  | ${"2022-11-01T00:00:00.000Z"}
    ${"day"}    | ${"2022-11-07T00:00:00.000Z"}
    ${"hour"}   | ${"2022-11-07T01:00:00.000Z"}
    ${"minute"} | ${"2022-11-07T01:23:00.000Z"}
    ${"second"} | ${"2022-11-07T01:23:45.000Z"}
    ${"week"}   | ${"2022-11-06T00:00:00.000Z"}
  `(".startOf('%s')", ({ unit, expected }) => {
    const base = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(base.startOf(unit)).toStrictEqual(DateTime.from(expected));
  });

  test.each`
    unit        | expected
    ${"year"}   | ${"2022-12-31T23:59:59.999Z"}
    ${"month"}  | ${"2022-11-30T23:59:59.999Z"}
    ${"day"}    | ${"2022-11-07T23:59:59.999Z"}
    ${"hour"}   | ${"2022-11-07T01:59:59.999Z"}
    ${"minute"} | ${"2022-11-07T01:23:59.999Z"}
    ${"second"} | ${"2022-11-07T01:23:45.999Z"}
    ${"week"}   | ${"2022-11-12T23:59:59.999Z"}
  `(".endOf('%s')", ({ unit, expected }) => {
    const base = DateTime.from("2022-11-07T01:23:45.678Z");
    expect(base.endOf(unit)).toStrictEqual(DateTime.from(expected));
  });
});

describe("plus / minus", () => {
  test("plus", () => {
    const dt = DateTime.from({ year: 2022 }).plus({
      months: 10,
      days: 6,
      hours: 1,
      minutes: 23,
      seconds: 45,
      milliseconds: 678,
    });

    expect(dt).toEqual(DateTime.from("2022-11-07T01:23:45.678Z"));
  });

  test("閏日の一年後", () => {
    const dt = DateTime.from({ year: 2020, month: 2, day: 29 });
    expect.assert(dt.isInLeapYear());
    expect(dt.plus({ years: 1 }).toString()).toBe("2021-03-01T00:00:00Z");
  });

  test("加算順序", () => {
    // day の加減算によって月を跨ぐ場合、計算順によって結果が変わる。
    const base = DateTime.from({ year: 2022 });
    expect(base.plus({ months: 1, days: 40 })).toEqual(
      base.plus({ months: 1 }).plus({ days: 40 }),
    );
  });
});
