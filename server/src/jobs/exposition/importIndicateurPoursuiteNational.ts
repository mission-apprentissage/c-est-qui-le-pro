import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { flatten, pick, range } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { ExpositionApi } from "#src/services/exposition/ExpositionApi.js";
import { DiplomeType, FormationVoie } from "shared";
import { kdb, upsert } from "#src/common/db/db.js";
import { sql } from "kysely";
import { computeTauxEnEmploi } from "#src/services/exposition/utils.js";

const logger = getLoggerWithContext("import");

async function importStatsForMillesime(expositionApi, limitPerPage, handleError, stats, millesime = null) {
  let currentDataMillesime = millesime;

  await oleoduc(
    Readable.from([
      await expositionApi
        .fetchNationalesStats(1, 1, millesime)
        .catch((e) => handleError(e, {}, "Impossible de récupérer le nombre de page des stats nationales")),
    ]),
    transformData((result) => {
      const nbPages = Math.ceil(result.pagination.total / limitPerPage);
      const pages = range(1, nbPages + 1);

      logger.info(`Récupération des stats nationales pour ${nbPages} pages`);

      return pages;
    }),
    flattenArray(),
    transformData(async (page) => {
      try {
        logger.info(`Récupération des stats nationales pour la page ${page}`);
        const formations = await expositionApi.fetchNationalesStats(page, limitPerPage, millesime);
        return formations.certifications;
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
        currentDataMillesime = data.millesime;
        try {
          await RawDataRepository.insertRaw(RawDataType.EXPOSITION_nationales, { data });

          logger.info(`Indicateur de poursuite nationales ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de poursuite nationales`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return currentDataMillesime;
}

async function importStats() {
  logger.info(`Importation des indicateurs de poursuite (données InserJeunes)`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const expositionApiOptions = { retry: { retries: 5 } };
  const expositionApi = new ExpositionApi(expositionApiOptions);

  const limitPerPage = 1000;

  function handleError(e, context, msg = `Impossible d'importer les stats nationales`) {
    logger.error({ err: e, ...context }, msg);
    stats.failed++;
    return null; //ignore chunk
  }

  await RawDataRepository.deleteAll(RawDataType.EXPOSITION_nationales);

  const lastMillesime = await importStatsForMillesime(expositionApi, limitPerPage, handleError, stats, null);
  await importStatsForMillesime(expositionApi, limitPerPage, handleError, stats, `${parseInt(lastMillesime) - 2}`);

  return stats;
}

async function importIndicateurs() {
  logger.info(`Importation des indicateurs de poursuite`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await RawDataRepository.search(RawDataType.EXPOSITION_nationales),
    filterData(({ data: { data } }) => {
      return data?.code_certification_type === "mef11" || data?.code_certification_type === "cfd";
    }),
    writeData(
      async ({ data: { data } }) => {
        const voie = data.code_certification_type == "mef11" ? FormationVoie.SCOLAIRE : FormationVoie.APPRENTISSAGE;
        const bcnMefData =
          voie === FormationVoie.SCOLAIRE &&
          ((
            await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
              mef_stat_11: data.code_certification,
            })
          )?.data as RawData[RawDataType.BCN_MEF]);

        const indicateurPoursuite = {
          cfd: data.code_formation_diplome,
          voie: voie,
          codeDispositif: voie === FormationVoie.SCOLAIRE ? bcnMefData?.dispositif_formation : null,
          millesime: data.millesime,
          part_en_emploi_6_mois: data.taux_en_emploi_6_mois,
          taux_en_emploi_6_mois: computeTauxEnEmploi(data),
          taux_en_formation: data.taux_en_formation,
          taux_autres_6_mois: data.taux_autres_6_mois,
          salaire_12_mois_q1: data.salaire_12_mois_q1,
          salaire_12_mois_q2: data.salaire_12_mois_q2,
          salaire_12_mois_q3: data.salaire_12_mois_q3,
        };

        try {
          await upsert(
            kdb,
            "indicateurPoursuiteNational",
            ["cfd", "voie", "codeDispositif", "millesime"],
            indicateurPoursuite,
            indicateurPoursuite,
            ["id"]
          );

          logger.info(
            `Indicateur de poursuite nationale ${Object.values(
              pick(indicateurPoursuite, ["cfd", "voie", "codeDispositif", "millesime"])
            ).join("/")} ajoutée`
          );
          stats.created++;
        } catch (e) {
          logger.error(
            e,
            `Impossible d'ajouter les indicateurs de poursuite nationale ${Object.values(
              pick(indicateurPoursuite, ["cfd", "voie", "codeDispositif", "millesime"])
            ).join("/")}`
          );
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

export async function importIndicateurPoursuiteNational() {
  const resultImport = await importStats();
  const resultImportIndicateurs = await importIndicateurs();

  // Check if we cover all code
  const diplomesCodeNotCover = await kdb
    .selectFrom(
      kdb
        .selectFrom("formationEtablissement")
        .innerJoin("formation", "formation.id", "formationEtablissement.formationId")
        .select((eb) => eb.fn<string>("SUBSTR", ["cfd", sql.val(1), sql.val(3)]).as("code"))
        .as("formations")
    )
    .select("code")
    .where("code", "not in", flatten(Object.values(DiplomeType)))
    .groupBy("code")
    .execute();

  if (diplomesCodeNotCover.length > 0) {
    logger.error(`Code diplome ${diplomesCodeNotCover.map((d) => d.code).join("/")} non couvert!`);
  }

  return {
    import: resultImport,
    importIndicateurs: resultImportIndicateurs,
  };
}
