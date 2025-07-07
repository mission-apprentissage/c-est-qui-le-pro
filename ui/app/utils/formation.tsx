import {
  Etablissement,
  FormationDetail,
  FormationFamilleMetierDetail,
  IndicateurPoursuite,
  IndicateurPoursuiteAnneeCommune,
  IndicateurPoursuiteRegional,
} from "shared";

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

export function formatIndicateurPoursuiteAnneeCommune(
  indicateurPoursuiteAnneeCommune?: IndicateurPoursuiteAnneeCommune[],
  formationFamilleMetier?: FormationFamilleMetierDetail[]
) {
  const indicateurPoursuite: {
    libelle?: string;
    codeCertification?: string;
    indicateurPoursuite?: IndicateurPoursuite;
    indicateurPoursuiteRegional?: IndicateurPoursuiteRegional;
  }[] = (indicateurPoursuiteAnneeCommune || []).map((indicateurPoursuite, index) => {
    const regional = formationFamilleMetier?.find((f) => f.formation.mef11 === indicateurPoursuite.codeCertification);
    return {
      libelle: indicateurPoursuite.libelle,
      codeCertification: indicateurPoursuite.codeCertification,
      indicateurPoursuite,
      indicateurPoursuiteRegional: regional?.formationEtablissement?.indicateurPoursuiteRegional,
    };
  });

  for (const formationDetail of formationFamilleMetier || []) {
    // Il peut y avoir des données au niveau régional qui n'existent pas dans indicateurPoursuiteAnneeCommune qui est construit à partir du niveau établissement des données IJs
    if (
      formationDetail.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome &&
      !indicateurPoursuite.find((f) => f.codeCertification === formationDetail.formation.mef11)
    ) {
      indicateurPoursuite.push({
        libelle: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome?.libelle,
        codeCertification: formationDetail.formation.mef11,
        indicateurPoursuiteRegional: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional,
      });
    }
  }

  return indicateurPoursuite;
}

export function hasIndicateurFamilleMetier(formationDetail: FormationDetail) {
  const { formationEtablissement, formationsFamilleMetier } = formationDetail;
  const indicateursPoursuite = formatIndicateurPoursuiteAnneeCommune(
    formationEtablissement.indicateurPoursuiteAnneeCommune,
    formationsFamilleMetier
  );

  return !!indicateursPoursuite.find((indicateurPoursuite, index) => {
    return (
      hasIndicateurEtablissement(indicateurPoursuite.indicateurPoursuite) ||
      hasIndicateurRegional(indicateurPoursuite.indicateurPoursuiteRegional) !== undefined
    );
  });
}
