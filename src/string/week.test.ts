import { describe, expect, test } from "@jest/globals";
import { Weekday } from "..";
import { weekdayStringShort } from "./week";

describe("weekdayStringShort", () => {
  test.each([
    ["Sun", Weekday.Sun],
    ["Mon", Weekday.Mon],
    ["Tue", Weekday.Tue],
    ["Wed", Weekday.Wed],
    ["Thu", Weekday.Thu],
    ["Fri", Weekday.Fri],
    ["Sat", Weekday.Sat],
  ])("%s", (string, day) => {
    expect(weekdayStringShort(day)).toBe(string);
  });
});
