import { expect, test } from "@jest/globals";
import { DateTime } from "./datetime.ts";
import { dayOfYear } from "./number.ts";

test.each(Array.from({ length: 12 }, (_, i) => DateTime.from([2022, i + 1])))(
  "dayOfYear('%s')",
  dt => {
    expect(dayOfYear(dt)).toBe((+dt - +dt.startOf("year")) / 86400000);
    expect(dt.startOf("year").plus({ days: dayOfYear(dt) })).toEqual(dt);
  },
);
