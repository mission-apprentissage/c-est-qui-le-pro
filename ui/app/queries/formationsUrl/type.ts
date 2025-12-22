import { object, number, InferType } from "yup";

const _getSchema = object({
  page: number().min(0).required(),
  limit: number().required(),
});
export type FormationsUrlRequestSchema = InferType<typeof _getSchema>;
