"use client";
import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "#/app/components/Modal";

export const modalSalaireGlobal = createModal({
  id: "salaire-global-modal",
  isOpenedByDefault: false,
});

export default function DialogSalaireGlobal() {
  return (
    <>
      <modalSalaireGlobal.Component
        topAnchor={false}
        title="À propos de la comparaison avec les autres salaires médians"
        buttons={[
          {
            doClosesModal: false,
            children: "Ok",
            onClick: async () => {
              modalSalaireGlobal.close();
            },
          },
        ]}
      >
        <p style={{ marginBottom: fr.spacing("8v") }}>
          Attention, ces salaires sont indicatifs et observés à l&apos;échelle de la France. Il existe une grande
          variabilité selon les territoires, les conditions de travail et les entreprises.
          <br />
          <br />
          Ici le <b>salaire médian</b> est positionné sur une échelle allant du plus bas salaire médian au plus haut
          salaire médian, observés pour des formations délivrant un diplôme équivalent. Le graphique permet donc de{" "}
          <b>
            comparer le salaire médian observé en sortie de formation aux autres formations délivrant un diplôme
            équivalent
          </b>
          .
          <br />
          Pour une formation en CAP par exemple, on compare le salaire à tous les CAP pour lesquels des données sont
          disponibles.
          <br />
          <br />
          Les salaires sont des salaires nets (avant impôt sur le revenu), par mois, en équivalent temps-plein, observés
          12 mois après la sortie de formation.
        </p>
      </modalSalaireGlobal.Component>
    </>
  );
}
