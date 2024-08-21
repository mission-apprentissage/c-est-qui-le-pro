import { Formation, formationSchema } from "#/types/formation";
import { FormationRequestSchema } from "./type";

export async function formation(
  params: FormationRequestSchema,
  { signal }: { signal: AbortSignal | undefined }
): Promise<Formation> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_ACCOMPAGNATEUR_API_BASE_URL;
  const url = API_BASE_URL + "/formation";

  const result = await fetch(`${url}/${params.id}`, {
    method: "GET",
    signal,
  });

  if (!result.ok) {
    throw new Error("Formation not found");
  }

  const json = await result.json();
  return await formationSchema.validate(json);
}
