import {
  Etablissement,
  FormationDetail,
  FormationFamilleMetierDetail,
  IndicateurPoursuite,
  IndicateurPoursuiteRegional,
  TransportModalite,
} from "shared";

export function formatLibelle(libelle: string | undefined): string {
  if (!libelle) {
    return "";
  }

  return libelle.charAt(0).toUpperCase() + libelle.slice(1);
}

export function formatAccessTime(time: number, modalite?: TransportModalite) {
  const suffix = modalite === "scolaire" ? " en bus scolaire" : "";
  if (time >= 3600) {
    return (
      <>
        À moins de {Math.floor(time / 3600).toFixed(0)}h{(time % 3600) / 60 || ""}
        {suffix}
      </>
    );
  }

  return (
    <>
      À moins de {(time / 60).toFixed(0)} minutes{suffix}
    </>
  );
}

export function formatStatut(etablissement: Etablissement): string {
  return etablissement.statut + (etablissement.statutDetail ? ` ${etablissement.statutDetail}` : "");
}

export function formatSalaire(salaire: number) {
  return salaire.toLocaleString().replace(/,/g, " ");
}

export function formatMillesime(str: string) {
  const part = str.split("_");
  if (part.length === 1) {
    return str;
  }

  return `${part[0]} et ${part[1]}`;
}

export function hasIndicateurEtablissement(indicateurPoursuite: IndicateurPoursuite | null | undefined) {
  return indicateurPoursuite?.taux_en_formation !== undefined;
}

export function hasIndicateurRegional(indicateurPoursuiteRegional: IndicateurPoursuiteRegional | null | undefined) {
  return indicateurPoursuiteRegional?.byDiplome?.taux_en_formation !== undefined;
}

export function formatIndicateurPoursuiteAnneeCommune(formationFamilleMetier?: FormationFamilleMetierDetail[]) {
  const indicateurPoursuite: {
    libelle?: string;
    codeCertification?: string;
    indicateurPoursuite?: IndicateurPoursuite;
    indicateurPoursuiteRegional?: IndicateurPoursuiteRegional;
  }[] = [];

  for (const formationDetail of formationFamilleMetier || []) {
    if (formationDetail.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome) {
      indicateurPoursuite.push({
        libelle: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome?.libelle,
        codeCertification: formationDetail.formation.mef11,
        indicateurPoursuite: formationDetail?.formationEtablissement?.indicateurPoursuite,
        indicateurPoursuiteRegional: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional,
      });
    }
  }

  return indicateurPoursuite;
}

export function hasIndicateurFamilleMetier(formationDetail: FormationDetail) {
  const { formationsFamilleMetier } = formationDetail;
  const indicateursPoursuite = formatIndicateurPoursuiteAnneeCommune(formationsFamilleMetier);

  return !!indicateursPoursuite.find((indicateurPoursuite) => {
    return (
      hasIndicateurEtablissement(indicateurPoursuite.indicateurPoursuite) ||
      hasIndicateurRegional(indicateurPoursuite.indicateurPoursuiteRegional) !== undefined
    );
  });
}

export function millesimeIndicateurIJ(formationDetail: FormationDetail) {
  const { indicateurPoursuite, indicateurPoursuiteRegional } = formationDetail.formationEtablissement;
  const { formationsFamilleMetier, formation } = formationDetail;

  if (formation.isAnneeCommune) {
    const formationFamilleMetierWithIndicateur = (formationsFamilleMetier || []).find(
      (f) =>
        f.formationEtablissement?.indicateurPoursuite?.millesime ||
        f.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome
    );

    if (formationFamilleMetierWithIndicateur?.formationEtablissement) {
      const {
        indicateurPoursuite: indicateurPoursuiteFamille,
        indicateurPoursuiteRegional: indicateurPoursuiteRegionalFamille,
      } = formationFamilleMetierWithIndicateur?.formationEtablissement;

      return indicateurPoursuiteFamille
        ? indicateurPoursuiteFamille.millesime
        : indicateurPoursuiteRegionalFamille?.byDiplome
        ? indicateurPoursuiteRegionalFamille.byDiplome?.millesime
        : "";
    }
  }

  return indicateurPoursuite
    ? indicateurPoursuite.millesime
    : indicateurPoursuiteRegional?.byDiplome
    ? indicateurPoursuiteRegional.byDiplome?.millesime
    : "";
}
