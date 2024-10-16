import { pickBy, isNil, isArray } from "lodash-es";

export function omitNil(obj) {
  if (isArray(obj)) {
    return obj.filter((v) => v);
  }

  return pickBy(obj, (v) => !isNil(v));
}
