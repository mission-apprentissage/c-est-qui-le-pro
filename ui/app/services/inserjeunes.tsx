/** @jsxImportSource @emotion/react */
"use client";
import { JSX } from "react";
import { IndicateurPoursuite } from "shared";
import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";

export type WidgetInserjeunesTypeMetrics = "emploi" | "autres" | "formation";
export type WidgetInserjeunesMetrics = {
  icon: FrIconClassName | RiIconClassName;
  colorIcon: string;
  color: string;
  description: string;
  metric: keyof Pick<IndicateurPoursuite, "taux_autres_6_mois" | "part_en_emploi_6_mois" | "taux_en_formation">;
  modalTitle: string;
  modalText: JSX.Element;
};

export const WIDGET_INSERJEUNES_TYPE: {
  [key in WidgetInserjeunesTypeMetrics]: WidgetInserjeunesMetrics;
} = {
  emploi: {
    icon: "ri-briefcase-4-line",
    colorIcon: "#58b77d",
    color: "#18753c",
    description: "TRAVAILLENT",
    metric: "part_en_emploi_6_mois",
    modalTitle: "Les élèves qui travaillent",
    modalText: (
      <>
        Il s&apos;agit du pourcentage de jeunes ayant trouvé un emploi 6 mois après leur dernière année dans cette
        formation.
        <br />
        <br />
        Ce chiffre comprend les emplois privés et publics mais uniquement salariés. Les auto-entreprises sont
        comptabilisées dans les “autres parcours”.
      </>
    ),
  },
  formation: {
    icon: "ri-graduation-cap-line",
    colorIcon: "#0063cb",
    color: "#0063cb",
    description: "ÉTUDIENT",
    metric: "taux_en_formation",
    modalTitle: "Les élèves qui poursuivent des études",
    modalText: (
      <>
        Il s&apos;agit du pourcentage de jeunes inscrits dans une formation 6 mois après leur dernière année dans cette
        formation.
        <br />
        <br /> Il peut s&apos;agir d&apos;un redoublement, d&apos;un autre niveau d&apos;étude, d&apos;une réorientation
        vers une nouvelle formation.
      </>
    ),
  },
  autres: {
    icon: "ri-route-line",
    colorIcon: "#fa794a",
    color: "#b34000",
    description: "AUTRES PARCOURS",
    metric: "taux_autres_6_mois",
    modalTitle: "Les élèves qui réalisent d’autres parcours",
    modalText: (
      <>
        Il s&apos;agit du pourcentage d&apos;élèves qui ne sont ni en emploi, ni en formation 6 mois après leur dernière
        année dans cette formation.
        <br />
        <br /> Ils peuvent être au chômage, en inactivité, indépendants, partis à l&apos;étranger, en formation privée
        hors contrat.
      </>
    ),
  },
};

export const computeTaux = (indicateurPoursuite: IndicateurPoursuite) => {
  return Object.keys(WIDGET_INSERJEUNES_TYPE).reduce(
    (acc, key, index) => {
      const keyTyped = key as WidgetInserjeunesTypeMetrics;
      const value = indicateurPoursuite[WIDGET_INSERJEUNES_TYPE[keyTyped].metric] || 0;
      const rounded = value > 0 && value < 5 ? 1 : Math.round(value / 10);
      let eleves = acc.prev + rounded > 10 ? 10 - acc.prev : rounded;
      // Use the last taux to round
      if (index === 2) {
        eleves = eleves + acc.prev < 10 ? 10 - acc.prev : eleves;
      }

      const lessOne = value > 0 && value < 5 && eleves === 1;

      acc.taux[keyTyped] = {
        rounded,
        eleves,
        lessOne,
      };
      acc.prev = acc.prev + acc.taux[keyTyped].eleves;
      return acc;
    },
    { taux: {}, prev: 0 } as {
      taux: { [key in WidgetInserjeunesTypeMetrics]: { rounded: number; eleves: number; lessOne: boolean } };
      prev: number;
    }
  ).taux;
};
