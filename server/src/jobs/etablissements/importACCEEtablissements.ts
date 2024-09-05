import { filterData, oleoduc, writeData } from "oleoduc";
import moment from "#src/common/utils/dateUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import * as ACCE from "#src/services/acce.js";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

export async function importACCEEtablissements(options = { acceFile: null }) {
  logger.info(`Importation des établissements depuis le fichier établissement de l'ACCE`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const etablissementsFilePath = options.acceFile || null;

  const formatDate = (dateStr) => (dateStr ? moment.tz(dateStr, "DD/MM/YYYY", "Europe/Paris").toDate() : null);

  // Clear old data
  await RawDataRepository.deleteAll(RawDataType.ACCE);

  await oleoduc(
    ACCE.etablissements(etablissementsFilePath),
    filterData((data) => data.nature_uai.match(/^[2345678]/)),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await RawDataRepository.insert(
            RawDataType.ACCE,
            omitNil({
              ...data,
              date_ouverture: formatDate(data.date_ouverture),
              date_fermeture: formatDate(data.date_fermeture),
              date_derniere_mise_a_jour: formatDate(data.date_derniere_mise_a_jour),
              date_geolocalisation: formatDate(data.date_geolocalisation),
            })
          );

          logger.info(`Nouveau établissement ${data.numero_uai} ajouté`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
