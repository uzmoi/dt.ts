import { fc } from "@fast-check/vitest";
import { NativeDate } from "../../src/native-date.ts";

export const plainDate = ({
  min,
  max,
}: {
  min?: number;
  max?: number;
} = {}): fc.Arbitrary<Temporal.PlainDate> =>
  fc
    .date({
      min: new NativeDate(min ?? 1970),
      max: new NativeDate(max ?? 9999),
      noInvalidDate: true,
    })
    .map(date =>
      Temporal.PlainDate.from({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      }),
    );
