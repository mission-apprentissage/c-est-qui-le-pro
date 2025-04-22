import { object, number, array, string, InferType } from "yup";
import { FormationTag, FormationDomaine, UAI_PATTERN, CFD_PATTERN, FormationVoie, DiplomeType } from "shared";

const transformArray = (value: string, originalValue: string) => {
  return originalValue ? originalValue.split(/[\s,|]+/) : [];
};

const getSchema = object({
  longitude: number().min(-180).max(180),
  latitude: number().min(-90).max(90),
  distance: number(),
  timeLimit: number().min(600).max(7200),
  tag: array()
    .transform(transformArray)
    .of(string().oneOf(Object.values(FormationTag)).required()),
  uais: array().transform(transformArray).of(string().matches(UAI_PATTERN)),
  cfds: array().transform(transformArray).of(string().matches(CFD_PATTERN)),
  voie: array()
    .transform(transformArray)
    .of(string().oneOf(Object.values(FormationVoie)).required()),
  diplome: array()
    .transform(transformArray)
    .of(string().oneOf(Object.keys(DiplomeType)).required()),
  domaines: array()
    .transform(function (value, originalValue) {
      return originalValue ? originalValue.split(/[|]+/) : [];
    })
    .of(string().oneOf(Object.values(FormationDomaine)).required()),
  formation: string()
    .nullable()
    .transform((_, value) => {
      return value === "" ? null : value;
    }),
  academie: string()
    .nullable()
    .transform((_, value) => {
      return value === "" ? null : value;
    }),
  minWeight: number().min(0).max(1000),
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
export type FormationsRequestSchema = InferType<typeof getSchema>;
