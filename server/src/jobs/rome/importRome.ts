import { oleoduc, writeData, filterData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { isRomeValid } from "#src/services/rome";
import RomeRepository from "#src/common/repositories/rome";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData.js";
import { FranceTravailApi } from "#src/services/franceTravail/FranceTravailApi.js";
import { omitNil } from "#src/common/utils/objectUtils.js";

const logger = getLoggerWithContext("import");

export async function importRome() {
  logger.info(`Importation des ROME`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const franceTravailApi = new FranceTravailApi();

  await RawDataRepository.deleteAll(RawDataType.FRANCE_TRAVAIL_metiers);

  await oleoduc(
    await franceTravailApi.fetchMetiers(),
    filterData((data) => {
      if (!isRomeValid(data.code)) {
        logger.error(`Le code rome ${data.code} n'est pas valide.`);
        stats.failed++;
        return false;
      }
      return true;
    }),
    writeData(
      async (data) => {
        stats.total++;

        const rome = data.code;

        try {
          await RawDataRepository.insertRaw(RawDataType.FRANCE_TRAVAIL_metiers, omitNil(data));

          await RomeRepository.upsert(["rome"], { rome }, { rome });

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
