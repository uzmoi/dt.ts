import { describe, expect, test } from "@jest/globals";
import type { DateObject } from "./datetime.ts";
import { dateToString } from "./string.ts";

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
