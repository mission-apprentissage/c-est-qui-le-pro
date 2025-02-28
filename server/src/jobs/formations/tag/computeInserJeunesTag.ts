import { FormationTag, getDiplomeType } from "shared";
import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb } from "#src/common/db/db";
import IndicateurPoursuiteRepository from "#src/common/repositories/indicateurPoursuite.js";

const logger = getLoggerWithContext("import");

export async function computeInserJeunesTag(formationEtablissement) {
  const diplomeType = getDiplomeType(formationEtablissement.formation.niveauDiplome);
  if (!diplomeType) {
    logger.error(`Niveau diplome ${formationEtablissement.formation.niveauDiplome} inconnu`);
    return [];
  }

  const indicateurPoursuiteRegional = await IndicateurPoursuiteRepository.quartileFor(
    diplomeType,
    formationEtablissement.etablissement.region
  );

  const indicateurPoursuite = await kdb
    .selectFrom("indicateurPoursuite")
    .selectAll()
    .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
    .orderBy("millesime desc")
    .limit(1)
    .executeTakeFirst();

  if (!indicateurPoursuite || indicateurPoursuite.taux_en_emploi_6_mois === null || !indicateurPoursuiteRegional) {
    return [];
  }

  return [
    ...(indicateurPoursuite.taux_en_emploi_6_mois >= indicateurPoursuiteRegional.taux_en_emploi_6_mois_q3
      ? [FormationTag.POUR_TRAVAILLER_RAPIDEMENT]
      : []),
  ];
}
