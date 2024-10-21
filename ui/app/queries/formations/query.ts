import { FormationDetail, formationDetailSchema } from "shared";
import { FormationsRequestSchema } from "./type";
import { PaginationsFormation, getPaginationFormationSchema } from "#/types/pagination";
import * as yup from "yup";
import { fetchJson } from "../../utils/fetch";
import { paramsToString } from "#/app/utils/searchParams";

const formationsPaginatedSchema: yup.ObjectSchema<PaginationsFormation<"formations", FormationDetail>> =
  getPaginationFormationSchema({
    formations: yup.array().of(formationDetailSchema).required(),
  });

export async function formations(
  params: FormationsRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<PaginationsFormation<"formations", FormationDetail>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formations";
  const json = await fetchJson(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
  });

  return await formationsPaginatedSchema.validate(json);
}
