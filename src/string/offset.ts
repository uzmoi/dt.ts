import { HOURS_IN_DAY, MINUTES_IN_HOUR } from "../time.ts";
import { formatInt } from "./utils.ts";

export interface OffsetParseOptions {
  /**
   * Whether to allow lowercase 'z'.
   * @default false
   */
  allowLowerCase?: boolean;

  /**
   * Whether to reject '±hh' format.
   * @default false
   */
  alwaysFull?: boolean;

  /**
   * Whether to reject basic format ('±hhmm').
   * @default false
   */
  alwaysExtended?: boolean;
}

const OffsetRegex = /^[+-](\d\d)(?::?(\d\d))?$/;

/**
 * Parse the offset string into a number in minutes.
 *
 * Formats:
 * - "Z"
 * - "±hh:mm"
 * - "±hhmm"
 * - "±hh"
 *
 * @example
 * ```ts
 * parseOffset("Z") // 0
 * parseOffset("+09:00") // 540
 * parseOffset("-0123") // -83
 * parseOffset("ｽﾞｲ₍₍(ง˘ω˘)ว⁾⁾ｽﾞｲ") // null
 * ```
 */
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
  /**
   * Whether to avoid using Z.
   * @default false
   */
  neverUseZ?: boolean;

  /**
   * Whether to allow '±hh' format when minutes is 0.
   * @default false
   */
  allowOmitMinutes?: boolean;

  /**
   * Whether to treat -0 the same as +0.
   * @default false
   */
  ignoreNegativeZero?: boolean;

  /**
   * The output format.
   * - basic: '±hhmm'
   * - extended: '±hh:mm'
   * @default "extended"
   */
  format?: "extended" | "basic";
}

const OFFSET_MAX = MINUTES_IN_HOUR * HOURS_IN_DAY;

/**
 * Format a numeric offset in minutes into a string.
 *
 * @throws {RangeError} If offset is out of range.
 *
 * @example
 * ```ts
 * formatOffset(0) // "Z"
 * formatOffset(540) // "+09:00"
 * formatOffset(-540) // "-09:00"
 * formatOffset(540, { format: "basic" }) // "+0900"
 * ```
 */
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
