import { HOURS_IN_DAY, MINUTES_IN_HOUR } from "../time.ts";
import { formatInt } from "./utils.ts";

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

  if (options?.alwaysExtended && offset.length === 5) {
    return null;
  }

  const matchResult = OffsetRegex.exec(offset);
  if (matchResult == null || (options?.alwaysFull && matchResult[2] == null)) {
    return null;
  }

  const hour = Number(matchResult[1]);
  const minute = Number(matchResult[2] || "");
  if (hour >= HOURS_IN_DAY || minute >= MINUTES_IN_HOUR) {
    return null;
  }

  return (offset[0] === "+" ? 1 : -1) * (hour * MINUTES_IN_HOUR + minute);
};

export interface OffsetFormatOptions {
  neverUseZ?: boolean;
  allowOmitMinutes?: boolean;
  ignoreNegativeZero?: boolean;
  /** @default "extended" */
  format?: "extended" | "basic";
}

const OFFSET_MAX = MINUTES_IN_HOUR * HOURS_IN_DAY;

export const formatOffset = (
  offset: number,
  options?: OffsetFormatOptions,
): string => {
  if (!(-OFFSET_MAX < offset && offset < OFFSET_MAX)) {
    throw new RangeError(
      `offset must be a valid number in minutes between -${OFFSET_MAX} and ${OFFSET_MAX}`,
    );
  }

  const isZero = options?.ignoreNegativeZero
    ? (offset | 0) === 0
    : Object.is(Math.trunc(offset), 0);

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
