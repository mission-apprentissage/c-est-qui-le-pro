import { isNil, round } from "lodash-es";

export function computeTauxEnEmploi(stats) {
  if (isNil(stats.nb_sortant) || isNil(stats.nb_en_emploi_6_mois) || stats.nb_sortant === 0) {
    return null;
  }

  return round((stats.nb_en_emploi_6_mois / stats.nb_sortant) * 100); // Expo utilise la part en emploi, on veut utiliser le taux en emploi ici
}
