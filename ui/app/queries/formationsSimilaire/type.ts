import { object, number, string, InferType } from "yup";

const getSchema = object({
  longitude: number().min(-180).max(180),
  latitude: number().min(-90).max(90),
  formationEtablissementId: string().required(),
});
export type FormationsSimilaireRequestSchema = InferType<typeof getSchema>;
