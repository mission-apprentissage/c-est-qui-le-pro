import { DiplomeType, FormationDomaine, FormationTag, FormationVoie } from "shared";
import * as yup from "yup";

export type SearchFormationFormData = {
  address: string;
  recherche?: string | null;
  tag?: FormationTag[];
  domaines?: FormationDomaine[];
  voie?: FormationVoie[];
  diplome?: (keyof typeof DiplomeType)[];
  minWeight?: number | null;
};

export const schema: yup.ObjectSchema<SearchFormationFormData> = yup
  .object({
    address: yup.string().required(),
    tag: yup.array().of(yup.string().oneOf(Object.values(FormationTag)).required()),
    domaines: yup.array().of(yup.string().oneOf(Object.values(FormationDomaine)).required()),
    voie: yup.array().of(yup.string().oneOf(Object.values(FormationVoie)).required()),
    diplome: yup.array().of(
      yup
        .string()
        .oneOf(Object.keys(DiplomeType) as (keyof typeof DiplomeType)[])
        .required()
    ),
    recherche: yup.string().nullable(),
    minWeight: yup.number().min(0).max(1000).nullable(),
  })
  .required();
