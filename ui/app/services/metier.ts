import { Metier, MetierTransitionType } from "shared";
import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";

export const METIER_TRANSITION: {
  [key in MetierTransitionType]: {
    label: string;
    icon: FrIconClassName | RiIconClassName;
  };
} = {
  transitionEcologique: {
    label: "Transition écologique",
    icon: "ri-seedling-line",
  },
  transitionDemographique: {
    label: "Transition démographique",
    icon: "ri-parent-line",
  },
  transitionNumerique: {
    label: "Transition numérique",
    icon: "ri-gamepad-line",
  },
};

export function sortMetier(metier: Metier[] = []) {
  return metier.sort((a, b) => {
    const isTransitionA = a.transitionDemographique || a.transitionEcologique || a.transitionNumerique ? 1 : 0;
    const isTransitionB = b.transitionDemographique || b.transitionEcologique || b.transitionNumerique ? 1 : 0;

    if (isTransitionA !== isTransitionB) {
      return isTransitionB - isTransitionA;
    }

    return a.libelle.localeCompare(b.libelle);
  });
}
