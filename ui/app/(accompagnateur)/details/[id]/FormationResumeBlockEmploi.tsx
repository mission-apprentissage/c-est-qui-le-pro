/** @jsxImportSource @emotion/react */
"use client";
import { Formation, FormationEtablissement } from "shared";
import Tag from "#/app/components/Tag";
import { isNil } from "lodash-es";
import { FormationResumeBlock, FormationResumeBlockProps } from "./FormationResume";

function FormationResumeBlockEmploiTag({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxEmploi = formationEtablissement?.indicateurPoursuite?.taux_en_emploi_6_mois;
  const tauxRegional = formationEtablissement?.indicateurPoursuiteRegional?.byDiplomeType;

  const admissionLevel =
    isNil(tauxEmploi) || isNil(tauxRegional) || isNil(tauxRegional?.taux_en_emploi_6_mois_q0)
      ? "unknow"
      : tauxEmploi >= tauxRegional.taux_en_emploi_6_mois_q3
      ? "easy"
      : tauxEmploi > tauxRegional.taux_en_emploi_6_mois_q1
      ? "average"
      : "hard";

  return (
    <>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très favorable
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Dans la moyenne
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Plutôt difficile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux d’emploi indisponible
          </Tag>
        )}
      </>
    </>
  );
}

function FormationResumeBlockEmploiAnneeCommuneTag({
  formationEtablissement,
}: {
  formationEtablissement: FormationEtablissement;
}) {
  const hasStatTerminale = formationEtablissement.indicateurPoursuiteAnneeCommune?.find(
    (stat) => stat.taux_en_emploi_6_mois !== undefined
  );

  return (
    <>
      {hasStatTerminale ? (
        <Tag square variant="dark-blue" bold={"500"}>
          Différent selon le Bac Pro choisi après cette seconde commune
        </Tag>
      ) : (
        <Tag square level="unknow">
          Nous n’avons pas cette information
        </Tag>
      )}
    </>
  );
}

function FormationResumeBlockEmploi({
  formation,
  formationEtablissement,
  ...formationResumeBlockProps
}: {
  formation: Formation;
  formationEtablissement: FormationEtablissement;
} & Partial<FormationResumeBlockProps>) {
  return (
    <FormationResumeBlock
      {...formationResumeBlockProps}
      title={"L'accès à l'emploi"}
      icon={"ri-briefcase-4-line"}
      anchor="acces-emploi"
    >
      {formation.isAnneeCommune ? (
        <FormationResumeBlockEmploiAnneeCommuneTag formationEtablissement={formationEtablissement} />
      ) : (
        <FormationResumeBlockEmploiTag formationEtablissement={formationEtablissement} />
      )}
    </FormationResumeBlock>
  );
}

export default FormationResumeBlockEmploi;
