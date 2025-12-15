/** @jsxImportSource @emotion/react */
"use client";
import { FormationDetail, FormationEtablissement } from "shared";
import Tag from "#/app/components/Tag";
import { isNil } from "lodash-es";
import { FormationResumeBlock, FormationResumeBlockProps } from "./FormationResume";
import { hasIndicateurFamilleMetier, hasIndicateurRegional } from "#/app/utils/formation";
import { useMemo } from "react";

function FormationResumeBlockEtudeTag({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxFormation = formationEtablissement?.indicateurPoursuite?.taux_en_formation;
  const tauxRegional = formationEtablissement?.indicateurPoursuiteRegional?.byDiplomeType;

  const admissionLevel =
    isNil(tauxFormation) || isNil(tauxRegional) || isNil(tauxRegional?.taux_en_formation_q0)
      ? hasIndicateurRegional(formationEtablissement?.indicateurPoursuiteRegional)
        ? "regional"
        : "unknow"
      : tauxFormation >= tauxRegional.taux_en_formation_q3
      ? "easy"
      : tauxFormation > tauxRegional.taux_en_formation_q1
      ? "average"
      : "hard";

  return (
    <>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Peu souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "regional" && (
          <Tag square variant="dark-blue" bold={"500"}>
            Consulter le taux régional
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux de poursuite d’études indisponible
          </Tag>
        )}
      </>
    </>
  );
}

function FormationResumeBlockEtudeAnneeCommuneTag({ formationDetail }: { formationDetail: FormationDetail }) {
  const hasStat = useMemo(() => hasIndicateurFamilleMetier(formationDetail), [formationDetail]);

  return (
    <>
      {hasStat ? (
        <Tag square variant="dark-blue" bold={"500"}>
          Différente selon le Bac Pro choisi après cette seconde commune
        </Tag>
      ) : (
        <Tag square level="unknow">
          Nous n’avons pas cette information
        </Tag>
      )}
    </>
  );
}

function FormationResumeBlockEtude({
  formationDetail,
  ...formationResumeBlockProps
}: {
  formationDetail: FormationDetail;
} & Partial<FormationResumeBlockProps>) {
  const { formationEtablissement, formation } = formationDetail;

  return (
    <FormationResumeBlock
      {...formationResumeBlockProps}
      title={"La poursuite d'études"}
      icon={"ri-sun-line"}
      anchor={"poursuite-etudes"}
    >
      {formation.isAnneeCommune ? (
        <FormationResumeBlockEtudeAnneeCommuneTag formationDetail={formationDetail} />
      ) : (
        <FormationResumeBlockEtudeTag formationEtablissement={formationEtablissement} />
      )}
    </FormationResumeBlock>
  );
}

export default FormationResumeBlockEtude;
