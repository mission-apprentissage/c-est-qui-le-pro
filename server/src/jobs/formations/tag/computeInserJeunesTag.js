import { isNil } from "lodash-es";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";

const logger = getLoggerWithContext("import");

export async function computeInserJeunesTag(
  formation,
  { thresholdEnEmploi = null, thresholdEnEtude = null } = {
    thresholdEnEmploi: null,
    thresholdEnEtude: null,
  }
) {
  if (isNil(thresholdEnEmploi) || isNil(thresholdEnEtude)) {
    logger.error("Seuil en emploi ou en étude non défini");
    return null;
  }

  if (!formation.indicateurPoursuite) {
    return [];
  }

  return [
    ...(formation.indicateurPoursuite.taux_en_emploi_6_mois >= thresholdEnEmploi
      ? [FORMATION_TAG.POUR_TRAVAILLER_RAPIDEMENT]
      : []),
    ...(formation.indicateurPoursuite.taux_en_formation >= thresholdEnEtude
      ? [FORMATION_TAG.POUR_CONTINUER_DES_ETUDES]
      : []),
  ];
}
