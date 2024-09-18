import { oleoduc, writeData, transformData } from "oleoduc";
import { flatten } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement.js";
import {
  FORMATION_TAG,
  THRESHOLD_TAUX_PRESSION,
  THRESHOLD_EN_EMPLOI,
} from "#src/common/constants/formationEtablissement.js";
import { computeInserJeunesTag } from "./computeInserJeunesTag.js";
import { computeIndicateurEntree } from "./computeIndicateurEntree.js";

const logger = getLoggerWithContext("import");

const COMPUTE_FORMATION_TAG = {
  inserjeunes: {
    tags: [FORMATION_TAG.POUR_TRAVAILLER_RAPIDEMENT],
    compute: async (
      formation,
      { thresholdEnEmploi } = {
        thresholdEnEmploi: THRESHOLD_EN_EMPLOI[0],
      }
    ) => {
      return computeInserJeunesTag(formation, { thresholdEnEmploi });
    },
  },
  indicateurEntree: {
    tags: [FORMATION_TAG.ADMISSION_FACILE],
    compute: async (formation, { thresholdTauxPression } = { thresholdTauxPression: THRESHOLD_TAUX_PRESSION[0] }) => {
      return computeIndicateurEntree(formation, { thresholdTauxPression });
    },
  },
};

export async function computeFormationTag() {
  logger.info(`Création des tags de formations`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await FormationEtablissementRepository.getAll(),
    transformData(async (formationEtablissement) => {
      const tags = flatten(
        await Promise.all(
          Object.values(COMPUTE_FORMATION_TAG).map(async (tag) => {
            const tags = await tag.compute(formationEtablissement);
            if (!tags.every((tagComputed) => tag.tags.includes(tagComputed))) {
              throw new Error(`Tag inconnu dans ${tags.join(",")}`);
            }

            return tags;
          })
        )
      );
      return { formationEtablissement, tags };
    }),
    writeData(
      async ({ formationEtablissement, tags }) => {
        try {
          const results = await FormationEtablissementRepository.updateBy(
            {
              tags,
            },
            { id: formationEtablissement.formationEtablissement.id }
          );

          if (results && results.length > 0) {
            logger.info(
              `Tags de formation ${formationEtablissement.etablissement.uai}/${formationEtablissement.formation.cfd} ajoutés`
            );
            stats.created++;
          }
        } catch (e) {
          logger.error(
            e,
            `Impossible d'ajouter les tags de la formation  ${formationEtablissement.etablissement.uai}/${formationEtablissement.formation.cfd}`
          );
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
