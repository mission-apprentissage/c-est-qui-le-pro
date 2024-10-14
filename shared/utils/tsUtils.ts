export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
