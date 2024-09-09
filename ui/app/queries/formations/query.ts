import { FormationDetail, formationDetailSchema } from "#/types/formation";
import { FormationsRequestSchema } from "./type";
import { Paginations, getPaginationSchema } from "#/types/pagination";
import * as yup from "yup";
import { fetchJson } from "../../utils/fetch";
import { paramsToString } from "#/app/utils/searchParams";

const formationsPaginatedSchema: yup.ObjectSchema<Paginations<"formations", FormationDetail>> = getPaginationSchema({
  formations: yup.array().of(formationDetailSchema).required(),
});

export async function formations(
  params: FormationsRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Paginations<"formations", FormationDetail>> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formations";
  const json = await fetchJson(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
  });

  return await formationsPaginatedSchema.validate(json);
}
