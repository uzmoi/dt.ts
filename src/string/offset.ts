import { HOURS_IN_DAY, MINUTES_IN_HOUR } from "../time.ts";
import { formatInt } from "./utils.ts";

export interface OffsetFormatOptions {
  neverUseZ?: boolean;
  allowOmitMinutes?: boolean;
  ignoreNegativeZero?: boolean;
  /** @default "extended" */
  format?: "extended" | "basic";
}

export const formatOffset = (
  offset: number,
  options?: OffsetFormatOptions,
): string => {
  const isZero = options?.ignoreNegativeZero
    ? offset === 0
    : Object.is(offset, 0);

  if (!options?.neverUseZ && isZero) {
    return "Z";
  }

  const sign = isZero || offset > 0 ? "+" : "-";
  const absOffset = Math.abs(offset);
  const delim = options?.format === "basic" ? "" : ":";
  const hour = formatInt(absOffset / MINUTES_IN_HOUR, 2);
  const minute = formatInt(absOffset % MINUTES_IN_HOUR, 2);

  if (options?.allowOmitMinutes && minute === "00") {
    return sign + hour;
  }

  return sign + hour + delim + minute;
};

export interface OffsetParseOptions {
  allowLowerCase?: boolean;
  alwaysFull?: boolean;
  alwaysExtended?: boolean;
}

const OffsetRegex = /^[+-](\d\d)(?::?(\d\d))?$/;

export const parseOffset = (
  offset: string,
  options?: OffsetParseOptions,
): number | null => {
  if (offset === "Z" || (options?.allowLowerCase && offset === "z")) {
    return 0;
  }

  const isBasicFormat = offset.length !== 6;

  if (options?.alwaysExtended && isBasicFormat) {
    return null;
  }

  const matchResult = OffsetRegex.exec(offset);
  if (matchResult == null || (options?.alwaysFull && matchResult[2] == null)) {
    return null;
  }

  const hour = Number(matchResult[1]);
  if (hour > HOURS_IN_DAY) {
    return null;
  }

  const minute = Number(matchResult[2] || "");
  if (minute >= MINUTES_IN_HOUR) {
    return null;
  }

  return (offset[0] === "+" ? 1 : -1) * (hour * MINUTES_IN_HOUR + minute);
};
