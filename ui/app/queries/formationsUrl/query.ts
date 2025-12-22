import * as yup from "yup";
import { fetchJson } from "../../utils/fetch";
import { paramsToString } from "#/app/utils/searchParams";
import { FormationsUrlRequestSchema } from "./type";

const formationsUrlsSchema = yup
  .array(
    yup.object({
      url: yup.string().required(),
      updatedAt: yup
        .date()
        .transform((value) => new Date(value))
        .required(),
    })
  )
  .required();

export async function formationsUrl(
  params: FormationsUrlRequestSchema,
  { signal }: { signal?: AbortSignal | undefined } = {}
): Promise<{ url: string; updatedAt: Date }[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formationsUrl";
  const json = await fetchJson(`${url}?${paramsToString(params)}`, {
    method: "GET",
    signal,
    next: { revalidate: 3600 },
  });

  return await formationsUrlsSchema.validate(json);
}
