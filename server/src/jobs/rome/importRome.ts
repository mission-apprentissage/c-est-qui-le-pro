import { oleoduc, writeData, filterData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { isRomeValid, romeFromCsv } from "#src/services/rome";
import RomeRepository from "#src/common/repositories/rome";

const logger = getLoggerWithContext("import");

export async function importRome(options = { romeFile: null }) {
  logger.info(`Importation des ROME`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const romeFile = options.romeFile || null;

  await oleoduc(
    await romeFromCsv(romeFile),
    filterData((data) => {
      if (!isRomeValid(data.code_rome)) {
        logger.error(`Le code rome ${data.code_rome} n'est pas valide.`);
        stats.failed++;
        return false;
      }
      return true;
    }),
    writeData(
      async (data) => {
        stats.total++;

        const rome = data.code_rome;

        try {
          await RomeRepository.upsert(["rome"], {
            rome,
          });

          logger.info(`Nouvelle donnée ${rome} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la donnée ${rome}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
