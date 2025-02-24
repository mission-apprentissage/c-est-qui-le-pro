export function isRomeValid(rome: string) {
  return rome.match(/^[A-Z][0-9]{4}/);
}
