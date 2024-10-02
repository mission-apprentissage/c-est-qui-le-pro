import { object, string, InferType, number } from "yup";

export const getSchema = object({
  id: string().required(),
  longitude: number().min(-180).max(180),
  latitude: number().min(-90).max(90),
});
export type FormationRequestSchema = InferType<typeof getSchema>;
