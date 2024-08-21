import { date, integer, object, objectId, string, arrayOf } from "./jsonSchema/jsonSchemaTypes.js";

export const name = "metrics";

export function indexes() {
  return [
    [{ time: 1, consumer: 1, url: 1 }, { unique: true }],
    [{ time: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }], // expires after 1y
    [{ consumer: 1 }],
    [{ url: 1 }],
    [{ uai: 1 }],
    [{ uais: 1 }],
    [{ cfd: 1 }],
    [{ cfds: 1 }],
  ];
}

export function schema() {
  return object(
    {
      _id: objectId(),
      time: date(),
      consumer: string(),
      url: string(),
      uai: string(),
      uais: arrayOf(string()),
      cfd: string(),
      cfds: arrayOf(string()),
      v: integer(),
    },
    { required: ["time", "consumer", "url"] }
  );
}
