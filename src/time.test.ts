import { describe, expect, test } from "@jest/globals";
import { Time } from "./time.ts";

test("parse", () => {
  const time = Time.parse("02:04:08.016");
  expect(time?.toString()).toStrictEqual("02:04:08.016");
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
