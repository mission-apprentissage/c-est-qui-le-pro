export function formatLibelle(libelle: string): string {
  return libelle.replace(/cap/gi, "CAP");
}

export function formatUrl(url: string | null): string {
  if (!url) {
    return null;
  }

  const urlTrimed = url.trim();
  if (!urlTrimed.match(/^http(s)?:\/\//)) {
    return "https://" + urlTrimed;
  }
  return urlTrimed;
}
