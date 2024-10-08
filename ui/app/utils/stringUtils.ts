export function pluralize(str: string, count: number): string {
  return str + (count > 1 ? "s" : "");
}
