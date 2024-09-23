import { oleoduc, writeData, flattenArray, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { merge, range } from "lodash-es";
import { Readable } from "stream";
import { OnisepApi } from "#src/services/onisep/OnisepApi.js";
import config from "#src/config.js";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

export async function importOnisep(
  type,
  keys = [],
  options = { limitPerPage: null, onisepApi: null, onisepApiOptions: null }
) {
  const dataset = config.onisep.datasets[type];
  if (!dataset) {
    logger.error(`Le dataset pour le type ${type} n'existe pas`);
    return null;
  }

  logger.info(`Importation du dataset Onisep ${type}/${dataset}`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const limitPerPage = options.limitPerPage || 1000;
  const onisepApiOptions = merge({ apiOptions: { retry: { retries: 5 } } }, options.onisepApiOptions || {});
  const onisepApi = options.onisepApi || new OnisepApi(onisepApiOptions);

  function handleError(e, context, msg = `Impossible d'importer la donnée`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  // Delete old data
  await RawDataRepository.deleteAll(RawDataType[`ONISEP_${type}`]);

  await oleoduc(
    Readable.from([
      await onisepApi
        .search(dataset, "", { from: 0, size: 1 })
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page du dataset")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.total / limitPerPage);
      const pages = range(0, nbPages);
      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        const result = await onisepApi.search(dataset, "", { from: page * limitPerPage, size: limitPerPage });
        return result.results;
      } catch (err) {
        return handleError(err, { page });
      }
    }),
    flattenArray(),
    writeData(
      async (data) => {
        stats.total++;

        const key = keys.map((k) => data[k]).join("-");
        const millesime = new Date().getFullYear().toString();

        try {
          await RawDataRepository.insertRaw(RawDataType[`ONISEP_${type}`], { millesime, data });

          logger.info(`Nouvelle donnée ${type}/${key} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la donnée ${type}/${key}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
