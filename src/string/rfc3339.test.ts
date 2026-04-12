import { describe, expect, test } from "vitest";
import { formatRFC3339, parseRFC3339 } from "./rfc3339.ts";

describe("parse", () => {
  test("valid", () => {
    expect(parseRFC3339("1975-01-01T00:00:00+00:00")).toEqual({
      year: 1975,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      offset: 0,
    });

    expect(parseRFC3339("1975-12-31T23:59:59-23:59")).toEqual({
      year: 1975,
      month: 12,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 0,
      offset: -(24 * 60 - 1),
    });
  });

  test("Allow lower case t and z", () => {
    expect(parseRFC3339("1970-01-01t00:00:00z")).not.toBeNull();
  });

  test("Allow a leap second at end of UTC day", () => {
    expect(parseRFC3339("1970-01-01T23:59:60Z")).not.toBeNull();
    expect(parseRFC3339("1970-01-01T08:59:60+09:00")).not.toBeNull();
  });

  describe("invalid", () => {
    test("month is 01-12", () => {
      expect(parseRFC3339("2000-00-01T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2000-13-01T00:00:00Z")).toBeNull();
    });

    test("day is 01-28, 01-29, 01-31 or 01-31", () => {
      expect(parseRFC3339("2000-01-00T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2021-02-29T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2020-02-30T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2000-09-31T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2000-08-32T00:00:00Z")).toBeNull();
    });

    test("hour is 00-23", () => {
      expect(parseRFC3339("0000-01-01T24:00:00Z")).toBeNull();
    });

    test("minute is 00-59", () => {
      expect(parseRFC3339("0000-01-01T00:60:00Z")).toBeNull();
    });

    test("second is 00-59 or 00-60", () => {
      expect(parseRFC3339("0000-01-01T00:00:60Z")).toBeNull();
      expect(parseRFC3339("0000-01-01T23:59:60+09:00")).toBeNull();
      expect(parseRFC3339("0000-01-01T23:59:61Z")).toBeNull();
    });
  });
});

describe("format", () => {
  test("second", () => {
    expect(
      formatRFC3339({
        year: 2025,
        month: 1,
        day: 2,
        hour: 3,
        minute: 4,
        second: 5,
        millisecond: 600,
        offset: 0,
      }),
    ).toBe("2025-01-02T03:04:05.6Z");
  });
});
