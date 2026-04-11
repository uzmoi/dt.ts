import { describe, expect, test } from "vitest";
import { formatOffset, parseOffset } from "./offset.ts";

describe("parseOffset", () => {
  describe("Z", () => {
    test("Parse uppercase Z as 0", () => {
      expect(parseOffset("Z")).toBe(0);
    });

    test("Z allowed even with alwaysExtended", () => {
      expect(parseOffset("Z", { alwaysExtended: true })).toBe(0);
    });

    test("Z allowed even with alwaysFull", () => {
      expect(parseOffset("Z", { alwaysFull: true })).toBe(0);
    });

    test("Reject lowercase z by default", () => {
      expect(parseOffset("z")).toBeNull();
    });

    test("Allow lowercase z with allowLowerCase", () => {
      expect(parseOffset("z", { allowLowerCase: true })).toBe(0);
    });
  });

  describe("Full number offset", () => {
    test.each([
      ["+00:00", 0],
      ["-00:00", -0],
      ["+01:30", 90],
      ["-01:30", -90],
      ["+23:59", 24 * 60 - 1],
    ])("Parse '%s' as %d", (string, minute) => {
      expect(parseOffset(string)).toBe(minute);
    });

    test("extended format with alwaysExtended", () => {
      expect(parseOffset("+01:30", { alwaysExtended: true })).toBe(90);
    });

    test("extended format with alwaysFull", () => {
      expect(parseOffset("+01:30", { alwaysFull: true })).toBe(90);
    });

    test("basic format", () => {
      expect(parseOffset("+0130")).toBe(90);
    });

    test("Reject basic format with alwaysExtended", () => {
      expect(parseOffset("+0130", { alwaysExtended: true })).toBeNull();
    });

    test("basic format with alwaysFull", () => {
      expect(parseOffset("+0130", { alwaysFull: true })).toBe(90);
    });
  });

  describe("Omit minutes", () => {
    test("without minutes", () => {
      expect(parseOffset("+01")).toBe(60);
    });

    test("Allow omitted minutes even with alwaysExtended", () => {
      expect(parseOffset("+01", { alwaysExtended: true })).toBe(60);
    });

    test("Reject omitted minutes with alwaysFull", () => {
      expect(parseOffset("+01", { alwaysFull: true })).toBeNull();
    });
  });

  describe("Invalid inputs", () => {
    test("Reject out of range hours", () => {
      expect(parseOffset("+24:00")).toBeNull();
    });

    test("Reject out of range minutes", () => {
      expect(parseOffset("+00:60")).toBeNull();
    });

    test.each([
      "",
      "1234",
      "12:34",
      "+1",
      "+12:34:56",
      " +12:34",
      "+12:34 ",
    ])("Reject '%s'", string => {
      expect(parseOffset(string)).toBeNull();
    });
  });
});

describe("formatOffset", () => {
  describe("Zero", () => {
    test("Format zero as Z", () => {
      expect(formatOffset(0)).toBe("Z");
    });

    test("Format zero as '+00:00' with neverUseZ", () => {
      expect(formatOffset(0, { neverUseZ: true })).toBe("+00:00");
    });

    test("Format negative zero as '-00:00'", () => {
      expect(formatOffset(-0)).toBe("-00:00");
    });

    test("Format negative zero as Z with ignoreNegativeZero", () => {
      expect(formatOffset(-0, { ignoreNegativeZero: true })).toBe("Z");
    });

    test("Format negative zero as '+00:00' with ignoreNegativeZero and neverUseZ", () => {
      expect(
        formatOffset(-0, {
          ignoreNegativeZero: true,
          neverUseZ: true,
        }),
      ).toBe("+00:00");
    });

    test("Truncate 0.x to zero and format as Z", () => {
      expect(formatOffset(0.5)).toBe("Z");
    });

    test("Truncate -0.x to zero and format as Z with ignoreNegativeZero", () => {
      expect(formatOffset(-0.5, { ignoreNegativeZero: true })).toBe("Z");
    });

    // ignoreNegativeZero によって isZero の判定式が変わることによるエッジケース。
    test("Format 90 as '+01:30' with ignoreNegativeZero", () => {
      expect(formatOffset(90, { ignoreNegativeZero: true })).toBe("+01:30");
    });
  });

  describe("Non-zero offset", () => {
    test.each([
      [90, "+01:30"],
      [-90, "-01:30"],
      [24 * 60 - 1, "+23:59"],
      [-24 * 60 + 1, "-23:59"],
    ])("Format 90 as '+01:30'", (minute, expected) => {
      expect(formatOffset(minute)).toBe(expected);
    });

    test("basic format", () => {
      expect(formatOffset(90, { format: "basic" })).toBe("+0130");
    });

    test("Omit minutes when zero with allowOmitMinutes", () => {
      expect(formatOffset(60, { allowOmitMinutes: true })).toBe("+01");
    });

    test("Keep minutes when non-zero with allowOmitMinutes", () => {
      expect(formatOffset(90, { allowOmitMinutes: true })).toBe("+01:30");
    });

    test("Keep minutes by default", () => {
      expect(formatOffset(60)).toBe("+01:00");
    });

    test("Truncate and omit minutes with allowOmitMinutes", () => {
      expect(formatOffset(60.5, { allowOmitMinutes: true })).toBe("+01");
    });

    test("Truncate and omit negative minutes with allowOmitMinutes", () => {
      expect(formatOffset(-60.5, { allowOmitMinutes: true })).toBe("-01");
    });
  });

  describe("Invalid inputs", () => {
    test("Reject out of range offset", () => {
      expect(() => formatOffset(24 * 60)).toThrowError(RangeError);
    });

    test("Reject out of range negative offset", () => {
      expect(() => formatOffset(-24 * 60)).toThrowError(RangeError);
    });

    test("Reject NaN", () => {
      expect(() => formatOffset(NaN)).toThrowError(RangeError);
    });
  });
});
