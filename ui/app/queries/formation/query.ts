import { paramsToString } from "#/app/utils/searchParams";
import { FormationDetail, formationDetailSchema } from "shared";
import { omit } from "lodash-es";
import { FormationRequestSchema } from "./type";

export async function formation(
  params: FormationRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<FormationDetail> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formation";

  const result = await fetch(`${url}/${params.id}?${paramsToString(omit(params, ["id"]))}`, {
    method: "GET",
    signal,
    next: { revalidate: 3600 },
  });

  if (!result.ok) {
    throw new Error("Formation not found");
  }

  const json = await result.json();

  return await formationDetailSchema.validate(json);
}
