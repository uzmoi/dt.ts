import { describe, expect, test } from "vitest";
import { Time } from "./time.ts";

describe("parse", () => {
  test.each([
    ["00:00:00", new Time()],
    ["02:59:59", new Time(2, 59, 59)],
    ["23:59:60", new Time(23, 59, 60)],
  ])("Parse '%s'", (string, time) => {
    expect(Time.parse(string)).toStrictEqual(time);
  });

  test("parse", () => {
    expect(Time.parse("02:04:08")).toStrictEqual(new Time(2, 4, 8, 0));
  });

  test("millisecond", () => {
    test("parse", () => {
      expect(Time.parse("02:04:08.016")).toStrictEqual(new Time(2, 4, 8, 16));
    });

    test("parse", () => {
      expect(Time.parse("02:04:08.16")).toStrictEqual(new Time(2, 4, 8, 160));
    });

    test("microsecond", () => {
      expect(Time.parse("02:04:08.00016")).toStrictEqual(
        new Time(2, 4, 8, 0.16),
      );
    });
  });

  describe("Invalid inputs", () => {
    test("empty", () => {
      expect(Time.parse("")).toBe(null);
    });
  });
});

describe("toString", () => {
  test("basic", () => {
    const time = new Time(2, 4, 8, 16);
    expect(time.toString("basic")).toBe("020408.016");
  });

  test("extended", () => {
    const time = new Time(2, 4, 8, 16);
    expect(time.toString()).toBe("02:04:08.016");
  });

  test("omit millisecond if zero", () => {
    const time = new Time();
    expect(time.toString()).toBe("00:00:00");
  });

  test("no trailing zero", () => {
    const time = new Time(0, 0, 0, 100);
    expect(time.toString()).toBe("00:00:00.1");
  });
});

describe("with", () => {
  test("empty", () => {
    const time = new Time(1, 2, 3, 4);
    expect(time.with({})).toStrictEqual(time);
  });

  test("full", () => {
    const time = new Time(1, 2, 3, 4);
    expect(
      time.with({ hour: 12, minute: 34, second: 56, millisecond: 789 }),
    ).toStrictEqual(new Time(12, 34, 56, 789));
  });
});
