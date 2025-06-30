import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { flatten, isNil, pick, range } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { ExpositionApi } from "#src/services/exposition/ExpositionApi.js";
import { DiplomeType, FormationVoie } from "shared";
import { kdb, upsert } from "#src/common/db/db.js";
import { sql } from "kysely";
import { computeTauxEnEmploi } from "#src/services/exposition/utils.js";

const logger = getLoggerWithContext("import");

async function importStats() {
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

async function importIndicateurs() {
  logger.info(`Importation des indicateurs de poursuite`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await RawDataRepository.search(RawDataType.EXPOSITION_regionales),
    filterData(({ data: { data } }) => {
      return (
        (data?.code_certification_type === "mef11" || data?.code_certification_type === "cfd") &&
        !isNil(data.taux_en_emploi_6_mois)
      );
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
          region: data.region.code,
          type: data?.donnee_source?.type,
          libelle: data.libelle,
          part_en_emploi_6_mois: data.taux_en_emploi_6_mois,
          taux_en_emploi_6_mois: computeTauxEnEmploi(data),
          taux_en_formation: data.taux_en_formation,
          taux_autres_6_mois: data.taux_autres_6_mois,
        };

        try {
          await upsert(
            kdb,
            "indicateurPoursuiteRegional",
            ["cfd", "voie", "codeDispositif", "millesime", "region"],
            indicateurPoursuite,
            indicateurPoursuite,
            ["id"]
          );

          logger.info(
            `Indicateur de poursuite régionale ${Object.values(
              pick(indicateurPoursuite, ["cfd", "voie", "codeDipositif", "millesime", "region"])
            ).join("/")} ajoutée`
          );
          stats.created++;
        } catch (e) {
          logger.error(
            e,
            `Impossible d'ajouter les indicateurs de poursuite régionale ${Object.values(
              pick(indicateurPoursuite, ["cfd", "voie", "codeDipositif", "millesime", "region"])
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

export async function importIndicateurPoursuiteRegionale() {
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
