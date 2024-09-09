import cleanDeep from "clean-deep";

export function formatArrayParameters(value) {
  return value.split ? value.split(/,|\|/) : [value];
}

export function stripNull(data) {
  return cleanDeep(data, {
    emptyArrays: false,
    emptyObjects: false,
    emptyStrings: false,
  });
}
