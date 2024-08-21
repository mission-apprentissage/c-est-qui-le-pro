import { merge } from "lodash-es";
import { date, object } from "./jsonSchemaTypes.js";

export function metaImportSchema() {
  return object(
    {
      date_import: date(),
    },
    { required: ["date_import"] }
  );
}

export function metaSchema(additionalSchema = []) {
  return merge(
    object(
      {
        created_on: date(),
        updated_on: date(),
      },
      {}
    ),
    ...additionalSchema
  );
}
