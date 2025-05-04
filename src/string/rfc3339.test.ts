import { describe, expect, test } from "@jest/globals";
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
    expect(parseRFC3339("1975-12-31T23:59:59-24:59")).toEqual({
      year: 1975,
      month: 12,
      day: 31,
      hour: 23,
      minute: 59,
      second: 59,
      millisecond: 0,
      offset: -(24 * 60 + 59),
    });
  });
  describe("invalid", () => {
    test("month", () => {
      expect(parseRFC3339("2000-00-01T00:00:00Z")).toBeNull();
      expect(parseRFC3339("2000-13-01T00:00:00Z")).toBeNull();
    });
    test("day", () => {
      expect(parseRFC3339("2000-01-00T00:00:00Z")).toBeNull();
      expect(parseRFC3339("1975-08-32T00:00:00Z")).toBeNull();
    });
    test("hour", () => {
      expect(parseRFC3339("0000-01-01T24:00:00Z")).toBeNull();
    });
    test("minute", () => {
      expect(parseRFC3339("0000-01-01T00:60:00Z")).toBeNull();
    });
    test("second", () => {
      expect(parseRFC3339("0000-01-01T00:00:60Z")).toBeNull();
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
