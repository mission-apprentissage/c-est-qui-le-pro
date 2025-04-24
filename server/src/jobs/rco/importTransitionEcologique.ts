import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { formacodeTransitionEcologique } from "#src/services/dataGouv/certifinfo.js";

const logger = getLoggerWithContext("import");

export async function importTransitionEcologique() {
  logger.info(`Importation des formacodes de la transition écologique du RCO`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  // Delete old data
  await RawDataRepository.deleteAll(RawDataType[`RCO_formacodeTransitionEco`]);

  try {
    const codes: RawData[`RCO_formacodeTransitionEco`][] = await formacodeTransitionEcologique();
    for (const code of codes) {
      try {
        await RawDataRepository.insertRaw(RawDataType[`RCO_formacodeTransitionEco`], code);

        logger.info(`Nouvelle donnée ${code["Code Formacode\u00AE V14"]} ajoutée`);
        stats.created++;
      } catch (e) {
        logger.error(e, `Impossible d'ajouter la donnée ${code["Code Formacode\u00AE V14"]}`);
        stats.failed++;
      }
    }
  } catch (err) {
    logger.error(err, "Impossible de récupérer le fichier de données de la transition écologique du RCO");
  }

  return stats;
}
