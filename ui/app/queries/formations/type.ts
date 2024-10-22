import { object, number, array, string, InferType } from "yup";
import { FormationTag, FormationDomaine, UAI_PATTERN, CFD_PATTERN } from "shared";

const getSchema = object({
  longitude: number().min(-180).max(180),
  latitude: number().min(-90).max(90),
  distance: number(),
  timeLimit: number().min(600).max(7200),
  tag: string()
    .oneOf(Object.values(FormationTag))
    .nullable()
    .transform((_, value) => {
      return value === "" ? null : value;
    }),
  uais: array()
    .transform(function (value, originalValue) {
      return originalValue ? originalValue.split(/[\s,]+/) : [];
    })
    .of(string().matches(UAI_PATTERN)),
  cfds: array()
    .transform(function (value, originalValue) {
      return originalValue ? originalValue.split(/[\s,]+/) : [];
    })
    .of(string().matches(CFD_PATTERN)),
  domaine: string()
    .oneOf(Object.values(FormationDomaine))
    .nullable()
    .transform((_, value) => {
      return value === "" ? null : value;
    }),
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
  page: number().required().default(0).min(0).integer(),
  items_par_page: number().required().default(10).positive().integer(),
});
export type FormationsRequestSchema = InferType<typeof getSchema>;
