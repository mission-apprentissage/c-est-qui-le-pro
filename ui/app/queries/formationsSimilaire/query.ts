import { FormationDetail, formationDetailSchema } from "#/types/formation";
import { FormationsSimilaireRequestSchema } from "./type";
import * as yup from "yup";
import { fetchJson } from "../../utils/fetch";
import { paramsToString } from "#/app/utils/searchParams";

const formationsSimilaireSchema = yup.array().of(formationDetailSchema).required();

export async function formationsSimilaire(
  params: FormationsSimilaireRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<FormationDetail[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formationsSimilaire";
  const json = await fetchJson(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
  });

  return await formationsSimilaireSchema.validate(json);
}
