export const formatInt = (n: number, len: number): string =>
  String(n | 0).padStart(len, "0");

export type Head3<T extends string> =
  T extends `${infer H1}${infer H2}${infer H3}${string}`
    ? `${H1}${H2}${H3}`
    : never;
