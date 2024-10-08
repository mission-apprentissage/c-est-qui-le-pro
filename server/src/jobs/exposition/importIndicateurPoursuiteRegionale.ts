import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { range } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";
import { ExpositionApi } from "#src/services/exposition/ExpositionApi.js";

const logger = getLoggerWithContext("import");

export async function importIndicateurPoursuiteRegionale() {
  logger.info(`Importation des indicateurs de poursuite (données InserJeunes)`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const expositionApiOptions = { retry: { retries: 5 } };
  const expositionApi = new ExpositionApi(expositionApiOptions);

  const limitPerPage = 1000;

  function handleError(e, context, msg = `Impossible d'importer les stats régionales`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  await RawDataRepository.deleteAll(RawDataType.EXPOSITION_regionales);

  await oleoduc(
    Readable.from([
      await expositionApi
        .fetchRegionalesStats(1, 1)
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page des stats régionales")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.pagination.total / limitPerPage);
      const pages = range(1, nbPages + 1);

      logger.info(`Récupération des stats régionales pour ${nbPages} pages`);

      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        logger.info(`Récupération des stats régionales pour la page ${page}`);
        const formations = await expositionApi.fetchRegionalesStats(page, limitPerPage);
        return formations.regionales;
      } catch (err) {
        return handleError(err, { page });
      }
    }),
    flattenArray(),
    filterData((data) => {
      return data.code_certification_type === "mef11" || data.code_certification_type === "cfd";
    }),
    writeData(
      async (data) => {
        try {
          await RawDataRepository.insertRaw(RawDataType.EXPOSITION_regionales, { data });

          logger.info(`Indicateur de poursuite régionales ${data.region.nom} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de poursuite régionales ${data.region.nom}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
