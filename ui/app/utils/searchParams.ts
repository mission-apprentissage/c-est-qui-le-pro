import { ReadonlyURLSearchParams } from "next/navigation";
import { FieldValues } from "react-hook-form";
import yup from "yup";
import { mapValues, isNil, omitBy, isArray } from "lodash-es";
import { Nullable } from "./types";

export function paramsToString(params: object): string {
  const removeEmpty = (v: any | any[]) => {
    return isArray(v) ? v.length === 0 : isNil(v);
  };

  return new URLSearchParams(
    mapValues(omitBy(params, removeEmpty), (v) => {
      if (isArray(v)) {
        return v.map((v) => v.toString()).join("|");
      }
      return v.toString();
    })
  ).toString();
}

export function searchParamsToObject<FormData extends FieldValues>(
  searchParams: ReadonlyURLSearchParams,
  defaultValues: Nullable<FormData>,
  schema: yup.ObjectSchema<FormData>
): FormData {
  const parameters: any = {};
  for (const [key, fieldSchema] of Object.entries(schema.fields)) {
    if (fieldSchema.type === "array") {
      const arrayField = searchParams.getAll(key).filter((elt) => !!elt) ?? null;
      if (arrayField) {
        parameters[key] = arrayField.length === 1 ? arrayField[0].split("|") : arrayField;
      }
      continue;
    }
    const field = searchParams.get(key) ?? defaultValues[key];
    parameters[key] = field;
  }

  return parameters;
}
