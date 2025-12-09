import { object, number, string, InferType } from "yup";

const _getSchema = object({
  longitude: number().min(-180).max(180),
  latitude: number().min(-90).max(90),
  formationEtablissementId: string().required(),
  academie: string().required(),
});
export type FormationsSimilaireRequestSchema = InferType<typeof _getSchema>;
