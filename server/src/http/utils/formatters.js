export function formatArrayParameters(value) {
  return value.split ? value.split(/,|\|/) : [value];
}
