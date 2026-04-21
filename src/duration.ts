import { todo } from "@uzmoi/ut/ils";

export interface DurationObject {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export class Duration implements DurationObject {
  constructor(
    readonly years: number,
    readonly months: number,
    readonly days: number,
    readonly hours: number,
    readonly minutes: number,
    readonly seconds: number,
    readonly milliseconds: number,
  ) {}

  toString(): string {
    return todo("formatDuration");
  }

  toJSON(): string {
    return this.toString();
  }

  valueOf(): never {
    throw new Error(todo("error message"));
  }
}
