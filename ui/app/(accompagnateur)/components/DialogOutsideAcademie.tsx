"use client";
import React, { useMemo } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "#/app/components/Modal";
import Link from "#/app/components/Link";
import { findAcademieByCode } from "shared/services/regions";

export const modalOutsideAcademie = createModal({
  id: "outside-academie-modal",
  isOpenedByDefault: false,
});

export default function DialogOutsideAcademie({ academie }: { academie?: string | null }) {
  const academieInfo = useMemo(() => findAcademieByCode(academie || ""), [academie]);

  return (
    <>
      <modalOutsideAcademie.Component
        title="Postuler dans un établissement hors de son académie de résidence"
        buttons={[
          {
            doClosesModal: false,
            children: "Ok",
            onClick: async () => {
              modalOutsideAcademie.close();
            },
          },
        ]}
      >
        <p style={{ marginBottom: fr.spacing("8v") }}>
          D’après votre lieu de recherche votre académie de rattachement serait l’
          <b>
            académie {academieInfo?.prefix}
            {academieInfo?.nom}
          </b>
          .
          <br />
          <br />
          Pour toute demande d&apos;affectation dans un lycée en dehors de votre académie, la demande de dérogation doit
          être justifiée : formations envisagées saturées ou inexistantes dans votre région ou déménagement par exemple.
          <br />
          <br />
          Dans les cas où toutes les formations que vous pouvez envisager en poursuite d&apos;études sont dispensées
          dans votre académie, il vous sera difficile d&apos;être affecté dans un lycée hors académie (une priorité
          étant donnée aux élèves appartenant à l&apos;académie).
          <br />
          <br />
          Renseignez-vous sur la procédure auprès de votre professeur principal ainsi que du psychologue de
          l&apos;éducation nationale qui assure des permanences dans votre lycée (sur rendez-vous) ou dans un CIO proche
          de chez vous.
          <br />
          <br />
          <Link
            onClick={() => {
              window.open(
                "https://www.onisep.fr/orientation/le-college/affectation-en-lycee-vos-questions-nos-reponses"
              );
            }}
            target="_blank"
            href="https://www.onisep.fr/orientation/le-college/affectation-en-lycee-vos-questions-nos-reponses"
          >
            En savoir plus
          </Link>
        </p>
      </modalOutsideAcademie.Component>
    </>
  );
}
