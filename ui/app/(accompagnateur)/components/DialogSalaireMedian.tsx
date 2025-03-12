"use client";
import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "#/app/components/Modal";

export const modalSalaireMedian = createModal({
  id: "salaire-median-modal",
  isOpenedByDefault: false,
});

export default function DialogSalaireMedian() {
  return (
    <>
      <modalSalaireMedian.Component
        topAnchor={false}
        title="À propos des salaires"
        buttons={[
          {
            doClosesModal: false,
            children: "Ok",
            onClick: async () => {
              modalSalaireMedian.close();
            },
          },
        ]}
      >
        <p style={{ marginBottom: fr.spacing("8v") }}>
          Attention, ces salaires sont indicatifs et observés à l&apos;échelle de la France.
          <br /> Il existe une grande variabilité selon les territoires, les conditions de travail et les entreprises.
          <br />
          Les données affichées présentent :
        </p>
        <ul>
          <li>
            Le salaire médian, qui divise les salariés en deux populations égales, avec 50% des salariés gagnant moins
            et 50% gagnant plus.
          </li>
          <li>
            La fourchette de salaire des 50% de salariés les plus proches du salaire médian, c&apos;est-à-dire entre les
            25% des salaires les plus bas et les 25% les plus hauts.
          </li>
        </ul>
        <p style={{ marginTop: fr.spacing("8v") }}>
          Les salaires sont des salaires nets (avant impôt sur le revenu), par mois, en équivalent temps-plein, observés
          12 mois après la sortie de formation.
        </p>
      </modalSalaireMedian.Component>
    </>
  );
}
