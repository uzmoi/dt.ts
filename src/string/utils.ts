export const formatInt = (n: number, len: number) =>
    String(n | 0).padStart(len, "0");
