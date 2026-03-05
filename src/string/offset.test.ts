import { describe, expect, test } from "vitest";
import { formatOffset, parseOffset } from "./offset";

describe("formatOffset", () => {
  test("Z", () => {
    expect(formatOffset(0)).toBe("Z");
  });
  test("+00:00", () => {
    expect(formatOffset(0, { neverUseZ: true })).toBe("+00:00");
  });
  test("-00:00", () => {
    expect(formatOffset(-0)).toBe("-00:00");
  });
  test("-00:00 (ignoreNegativeZero: true)", () => {
    expect(formatOffset(-0, { ignoreNegativeZero: true })).toBe("Z");
  });
  test("+01:30", () => {
    expect(formatOffset(90)).toBe("+01:30");
  });
  test("-01:30", () => {
    expect(formatOffset(-90)).toBe("-01:30");
  });
  test("basic format", () => {
    expect(formatOffset(90, { format: "basic" })).toBe("+0130");
  });
  test("omit minutes", () => {
    expect(formatOffset(60, { allowOmitMinutes: true })).toBe("+01");
  });
});

describe("parseOffset", () => {
  test("Z (upper case)", () => {
    expect(parseOffset("Z")).toBe(0);
  });
  describe("z (lower case)", () => {
    test("default", () => {
      expect(parseOffset("z")).toBeNull();
    });
    test("allowLowerZ: true", () => {
      expect(parseOffset("z", { allowLowerCase: true })).toBe(0);
    });
  });
  test("+00:00", () => {
    expect(parseOffset("+00:00")).toBe(0);
  });
  test("-00:00", () => {
    expect(parseOffset("-00:00")).toBe(-0);
  });
  test("+01:30", () => {
    expect(parseOffset("+01:30")).toBe(90);
  });
  test("-01:30", () => {
    expect(parseOffset("-01:30")).toBe(-90);
  });
  test("basic format", () => {
    expect(parseOffset("+0130")).toBe(90);
  });
  test("basic format (alwaysExtended: true)", () => {
    expect(parseOffset("+0130", { alwaysExtended: true })).toBeNull();
  });
  test("omit minutes", () => {
    expect(parseOffset("+01")).toBe(60);
  });
  test("omit minutes (alwaysFull: true)", () => {
    expect(parseOffset("+01", { alwaysFull: true })).toBeNull();
  });
  test("invalid minutes", () => {
    expect(parseOffset("+00:60")).toBeNull();
  });
  test("invalid hours", () => {
    expect(parseOffset("+25:00")).toBeNull();
  });
});
