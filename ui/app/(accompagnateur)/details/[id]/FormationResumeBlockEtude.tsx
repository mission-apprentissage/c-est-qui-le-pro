/** @jsxImportSource @emotion/react */
"use client";
import { Formation, FormationEtablissement } from "shared";
import Tag from "#/app/components/Tag";
import { isNil } from "lodash-es";
import { FormationResumeBlock, FormationResumeBlockProps } from "./FormationResume";

function FormationResumeBlockEtudeTag({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxFormation = formationEtablissement?.indicateurPoursuite?.taux_en_formation;
  const tauxRegional = formationEtablissement?.indicateurPoursuiteRegional;

  const admissionLevel =
    isNil(tauxFormation) || isNil(tauxRegional) || isNil(tauxRegional?.taux_en_formation_q0)
      ? "unknow"
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
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux de poursuite d’études indisponible
          </Tag>
        )}
      </>
    </>
  );
}

function FormationResumeBlockEtudeAnneeCommuneTag({
  formationEtablissement,
}: {
  formationEtablissement: FormationEtablissement;
}) {
  const hasStatTerminale = formationEtablissement.indicateurPoursuiteAnneeCommune?.find(
    (stat) => stat.taux_en_formation !== undefined
  );

  return (
    <>
      {hasStatTerminale ? (
        <Tag square variant="dark-blue" bold={"500"}>
          Différent selon le Bac Pro choisi après de cette seconde commune
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
  formationEtablissement,
  formation,
  ...formationResumeBlockProps
}: {
  formationEtablissement: FormationEtablissement;
  formation: Formation;
} & Partial<FormationResumeBlockProps>) {
  return (
    <FormationResumeBlock
      {...formationResumeBlockProps}
      title={"La poursuite d'études"}
      icon={"ri-sun-line"}
      anchor={"poursuite-etudes"}
    >
      {formation.isAnneeCommune ? (
        <FormationResumeBlockEtudeAnneeCommuneTag formationEtablissement={formationEtablissement} />
      ) : (
        <FormationResumeBlockEtudeTag formationEtablissement={formationEtablissement} />
      )}
    </FormationResumeBlock>
  );
}

export default FormationResumeBlockEtude;
