import { isNil } from "lodash-es";
import { FormationTag } from "shared";
import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb } from "#src/common/db/db";

const logger = getLoggerWithContext("import");

export async function computeIndicateurEntree(
  formationEtablissement,
  { thresholdTauxPression = null } = {
    thresholdTauxPression: null,
  }
) {
  if (isNil(thresholdTauxPression)) {
    logger.error("Seuil pour le taux de pression non défini");
    return null;
  }

  const indicateurEntree = await kdb
    .selectFrom("indicateurEntree")
    .selectAll()
    .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
    .orderBy("rentreeScolaire desc")
    .limit(1)
    .executeTakeFirst();

  const tauxPression = indicateurEntree?.tauxPression;

  if (isNil(tauxPression)) {
    return [];
  }

  if (tauxPression >= thresholdTauxPression) {
    return [];
  }

  return [FormationTag.FAIBLE_TAUX_PRESSION];
}
