import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { range } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import { ExpositionApi } from "#src/services/exposition/ExpositionApi.js";
import { kdb, upsert } from "#src/common/db/db";
import { computeTauxEnEmploi } from "#src/services/exposition/utils.js";
import { omitNil } from "#src/common/utils/objectUtils.js";

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
      const formationEtablissement = await (formationStats.code_certification_type === "mef11"
        ? FormationEtablissementRepository.getFromMef({
            uai: formationStats.uai,
            mef11: formationStats.code_certification,
          })
        : FormationEtablissementRepository.getFromCfd({
            uai: formationStats.uai,
            cfd: formationStats.code_certification,
            codeDispositif: null,
            voie: "apprentissage",
          }));

      return { formationStats, formationEtablissement };
    }),
    filterData((data) => data && data.formationEtablissement),
    writeData(
      async ({ formationEtablissement: { formationEtablissement, etablissement, formation }, formationStats }) => {
        const indicateurPoursuite = omitNil({
          formationEtablissementId: formationEtablissement.id,
          millesime: formationStats.millesime,
          taux_en_emploi_6_mois: computeTauxEnEmploi(formationStats),
          part_en_emploi_6_mois: formationStats.taux_en_emploi_6_mois,
          taux_en_formation: formationStats.taux_en_formation,
          taux_autres_6_mois: formationStats.taux_autres_6_mois,
        });

        try {
          await upsert(
            kdb,
            "indicateurPoursuite",
            ["formationEtablissementId", "millesime"],
            indicateurPoursuite,
            indicateurPoursuite,
            ["id"]
          );

          logger.info(`Indicateur de poursuite ${etablissement.uai}/${formation.cfd} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de la poursuite ${etablissement.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
