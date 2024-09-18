import { oleoduc, writeData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import config from "#src/config.js";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";
import { getFromBucket } from "#src/services/rco.js";

const logger = getLoggerWithContext("import");

export async function importCertifInfo(type) {
  logger.info(`Importation de certif info`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const file = config.rco.file[type];

  // Delete old data
  await RawDataRepository.deleteAll(RawDataType[`RCO_${type}`]);

  await oleoduc(
    await getFromBucket(file),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await RawDataRepository.insertRaw(RawDataType[`RCO_${type}`], { data });

          logger.info(`Nouvelle donnée ${type} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la donnée ${type}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
