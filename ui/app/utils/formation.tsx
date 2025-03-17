import { Etablissement } from "shared";

export function formatLibelle(libelle: string | undefined): string {
  if (!libelle) {
    return "";
  }

  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

export function formatAccessTime(time: number) {
  if (time >= 3600) {
    return (
      <>
        À moins de {Math.floor(time / 3600).toFixed(0)}h{(time % 3600) / 60 || ""}
      </>
    );
  }

  return <>À moins de {(time / 60).toFixed(0)} minutes</>;
}

export function formatStatut(etablissement: Etablissement): string {
  return etablissement.statut + (etablissement.statutDetail ? ` ${etablissement.statutDetail}` : "");
}

export function formatSalaire(salaire: number) {
  return salaire.toLocaleString().replace(/,/g, " ");
}
