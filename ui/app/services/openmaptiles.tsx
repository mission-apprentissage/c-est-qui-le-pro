const API_BASE_URL = "https://openmaptiles.geo.data.gouv.fr";

export async function fetchStyle(
  style: string = "osm-bright",
  { signal }: { signal: AbortSignal | undefined } = { signal: undefined }
): Promise<{ [key: string]: any } | null> {
  const result = await fetch(`${API_BASE_URL}/styles/${style}/style.json`, {
    signal,
  });
  const json = await result.json();
  return json;
}
