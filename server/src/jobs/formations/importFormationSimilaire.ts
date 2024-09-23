import { oleoduc, writeData, transformData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationSimilaireRepository from "#src/common/repositories/formationSimilaire.js";
import FormationRepository from "#src/common/repositories/formation.js";
import fs from "fs";
import config from "#src/config.js";
import { Readable } from "stream";

const logger = getLoggerWithContext("import");

export async function importFormationSimilaire() {
  logger.info(`Importation des formations similaires`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const formationSimilaire = JSON.parse(await fs.promises.readFile(config.formation.files.formationSimilaire, "utf8"));

  // Clean old
  await FormationSimilaireRepository.remove({});

  await oleoduc(
    Readable.from(Object.entries(formationSimilaire)),
    transformData(async (data) => {
      const formations = await FormationRepository.find(
        {
          cfd: data[0],
        },
        false
      );
      const formationSimilaire = [];
      for (const cfd of data[1]) {
        const formations = (await FormationRepository.find({ cfd: cfd }, false)).map((f) => f.id);
        formationSimilaire.push(...formations);
      }

      return formations.map((formation) => ({ formation, formationSimilaire }));
    }),
    flattenArray(),
    writeData(
      async ({ formation, formationSimilaire }) => {
        try {
          for (const index in formationSimilaire) {
            await FormationSimilaireRepository.insert({
              formationId: formation.id,
              formationRelatedId: formationSimilaire[index],
              similarityOrder: parseInt(index),
            });
          }

          logger.info(
            `${formationSimilaire.length} formation similaire pour ${
              formation.mef11 ? formation.mef11 : formation.cfd
            } ajoutées`
          );
          stats.created++;
        } catch (e) {
          logger.error(e, `Formation similaire pour ${formation.mef11 ? formation.mef11 : formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
