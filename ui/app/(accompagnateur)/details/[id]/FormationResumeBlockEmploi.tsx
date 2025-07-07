/** @jsxImportSource @emotion/react */
"use client";
import { FormationDetail, FormationEtablissement } from "shared";
import Tag from "#/app/components/Tag";
import { isNil } from "lodash-es";
import { FormationResumeBlock, FormationResumeBlockProps } from "./FormationResume";
import { hasIndicateurFamilleMetier, hasIndicateurRegional } from "#/app/utils/formation";
import { useMemo } from "react";

function FormationResumeBlockEmploiTag({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxEmploi = formationEtablissement?.indicateurPoursuite?.taux_en_emploi_6_mois;
  const tauxRegional = formationEtablissement?.indicateurPoursuiteRegional?.byDiplomeType;

  const admissionLevel =
    isNil(tauxEmploi) || isNil(tauxRegional) || isNil(tauxRegional?.taux_en_emploi_6_mois_q0)
      ? hasIndicateurRegional(formationEtablissement?.indicateurPoursuiteRegional)
        ? "regional"
        : "unknow"
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
        {admissionLevel === "regional" && (
          <Tag square variant="purple-light">
            Consulter le taux régional
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

function FormationResumeBlockEmploiAnneeCommuneTag({ formationDetail }: { formationDetail: FormationDetail }) {
  const hasStat = useMemo(() => hasIndicateurFamilleMetier(formationDetail), [formationDetail]);

  return (
    <>
      {hasStat ? (
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
  formationDetail,
  ...formationResumeBlockProps
}: {
  formationDetail: FormationDetail;
} & Partial<FormationResumeBlockProps>) {
  const { formationEtablissement, formation } = formationDetail;

  return (
    <FormationResumeBlock
      {...formationResumeBlockProps}
      title={"L'accès à l'emploi"}
      icon={"ri-briefcase-4-line"}
      anchor="acces-emploi"
    >
      {formation.isAnneeCommune ? (
        <FormationResumeBlockEmploiAnneeCommuneTag formationDetail={formationDetail} />
      ) : (
        <FormationResumeBlockEmploiTag formationEtablissement={formationEtablissement} />
      )}
    </FormationResumeBlock>
  );
}

export default FormationResumeBlockEmploi;
