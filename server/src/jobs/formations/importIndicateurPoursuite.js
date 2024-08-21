import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { range } from "lodash-es";
import { updateOne } from "#src/common/db/mongodb.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { formationEtablissement } from "#src/common/db/collections/collections.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement.js";
import { ExpositionApi } from "#src/services/exposition/ExpositionApi.js";

const logger = getLoggerWithContext("import");

export async function importIndicateurPoursuite() {
  logger.info(`Importation des indicateurs de poursuite (données InserJeunes)`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const expositionApiOptions = { retry: { retries: 5 } };
  const expositionApi = new ExpositionApi(expositionApiOptions);

  const limitPerPage = 1000;

  function handleError(e, context, msg = `Impossible d'importer les stats de formations`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  await oleoduc(
    Readable.from([
      await expositionApi
        .fetchFormationsStats(1, 1)
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page des stats de formations")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.pagination.total / limitPerPage);
      const pages = range(1, nbPages + 1);

      logger.info(`Récupération des stats de formations pour ${nbPages} pages`);

      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        logger.info(`Récupération des stats de formations pour la page ${page}`);
        const formations = await expositionApi.fetchFormationsStats(page, limitPerPage);
        return formations.formations;
      } catch (err) {
        return handleError(err, { page });
      }
    }),
    flattenArray(),
    filterData((data) => data.code_certification_type === "mef11" || data.code_certification_type === "cfd"),
    transformData(async (formationStats) => {
      try {
        const formation = await FormationEtablissementRepository.first({
          uai: formationStats.uai,
          ...(formationStats.code_certification_type === "mef11"
            ? {
                mef11: formationStats.code_certification,
              }
            : { cfd: formationStats.code_certification }),
        });

        if (!formation) {
          return null;
        }

        return {
          formation,
          formationStats,
        };
      } catch (e) {
        if (e.httpStatusCode === 404) {
          return null;
        }

        logger.error(e, "Impossible de récupérer les données InserJeunes");
        return null;
      }
    }),
    filterData((data) => data),
    writeData(
      async ({ formation, formationStats }) => {
        const indicateurPoursuite = {
          millesime: formationStats.millesime,
          taux_en_emploi_6_mois: formationStats.taux_en_emploi_6_mois,
          taux_en_formation: formationStats.taux_en_formation,
          taux_autres_6_mois: formationStats.taux_autres_6_mois,
        };

        try {
          const res = await updateOne(
            formationEtablissement(),
            { _id: formation._id },
            {
              $set: {
                indicateurPoursuite: omitNil(indicateurPoursuite),
              },
            }
          );

          if (res.upsertedCount) {
            logger.info(`Indicateur de poursuite ${formation.uai}/${formation.cfd} ajoutée`);
            stats.created++;
          } else if (res.modifiedCount) {
            logger.info(`Indicateur de poursuite ${formation.uai}/${formation.cfd} mis à jour`);
            stats.updated++;
          } else {
            logger.trace(`Indicateur de poursuite ${formation.uai}/${formation.cfd} déjà à jour`);
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de la poursuite ${formation.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
