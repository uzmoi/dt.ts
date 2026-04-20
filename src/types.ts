// literal union の{}と交差してるリテラルじゃない型を除外するユーティリティ型。
// branded types も消してしまう。
export type Strict<T> = {
  [P in keyof T]: Exclude<T[P], object>;
};
