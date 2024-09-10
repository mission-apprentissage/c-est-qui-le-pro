export function urlOnisepToId(url: string): string | null {
  const urlOnisep = url;
  const matching = urlOnisep.match(/FOR\.[0-9]+/);
  return matching ? matching[0] : null;
}
