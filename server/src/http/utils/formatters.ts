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

export function cleanString(value) {
  if (!value) {
    return value;
  }

  return value.replace(/\s+/g, " ").trim();
}
