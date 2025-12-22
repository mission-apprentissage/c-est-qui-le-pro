import * as yup from "yup";
import { fetchJson } from "../../utils/fetch";

const formationsCountSchema = yup.number().default(0);

export async function formationsCount({ signal }: { signal?: AbortSignal | undefined } = {}): Promise<number> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formationsCount";
  const json = await fetchJson(`${url}`, {
    method: "GET",
    signal,
    next: { revalidate: 3600 },
  });

  return await formationsCountSchema.validate(json);
}
