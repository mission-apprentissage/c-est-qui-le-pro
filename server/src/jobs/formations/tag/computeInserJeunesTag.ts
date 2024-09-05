import { isNil } from "lodash-es";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb } from "#src/common/db/db";

const logger = getLoggerWithContext("import");

export async function computeInserJeunesTag(
  formationEtablissement,
  { thresholdEnEmploi = null, thresholdEnEtude = null } = {
    thresholdEnEmploi: null,
    thresholdEnEtude: null,
  }
) {
  if (isNil(thresholdEnEmploi) || isNil(thresholdEnEtude)) {
    logger.error("Seuil en emploi ou en étude non défini");
    return null;
  }

  const indicateurPoursuite = await kdb
    .selectFrom("indicateurPoursuite")
    .selectAll()
    .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
    .orderBy("millesime desc")
    .limit(1)
    .executeTakeFirst();

  if (!indicateurPoursuite) {
    return [];
  }

  return [
    ...(indicateurPoursuite.taux_en_emploi_6_mois >= thresholdEnEmploi
      ? [FORMATION_TAG.POUR_TRAVAILLER_RAPIDEMENT]
      : []),
    ...(indicateurPoursuite.taux_en_formation >= thresholdEnEtude ? [FORMATION_TAG.POUR_CONTINUER_DES_ETUDES] : []),
  ];
}
