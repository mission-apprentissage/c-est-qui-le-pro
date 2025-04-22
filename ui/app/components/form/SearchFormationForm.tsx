import * as yup from "yup";

export type SearchFormationFormData = {
  address: string;
  formation?: string | null;
  tag?: string[];
  domaines?: string[];
  voie?: string[];
  diplome?: string[];
};

export const schema: yup.ObjectSchema<SearchFormationFormData> = yup
  .object({
    address: yup.string().required(),
    tag: yup.array().of(yup.string().required()),
    domaines: yup.array().of(yup.string().required()),
    voie: yup.array().of(yup.string().required()),
    diplome: yup.array().of(yup.string().required()),
    formation: yup.string().nullable(),
    minWeight: yup.number().min(0).max(1000).nullable(),
  })
  .required();
