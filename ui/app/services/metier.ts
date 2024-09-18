import { Metier } from "#/types/formation";

export const METIER_TRANSITION = {
  transitionEcologique: {
    label: "Transition écologique",
  },
  transitionDemographique: {
    label: "Transition démographique",
  },
  transitionNumerique: {
    label: "Transition numérique",
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
