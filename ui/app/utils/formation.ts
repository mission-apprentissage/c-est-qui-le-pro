export function formatLibelle(libelle: string | undefined): string {
  if (!libelle) {
    return "";
  }

  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}
