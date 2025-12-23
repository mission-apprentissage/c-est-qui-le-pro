import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { getFamilleMetier, getLienFamilleMetier } from "#src/services/bcn/bcn.js";
import FamilleMetierRepository from "#src/common/repositories/familleMetier";
import FormationRepository from "#src/common/repositories/formation.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData.js";
import { BCNApi } from "#src/services/bcn/BCNApi.js";
import * as Query from "#src/queries/isAnneeCommune";
import { Readable } from "stream";

const logger = getLoggerWithContext("import");

async function importFamillesMetiersListe() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const bcnApi = new BCNApi();

  await oleoduc(
    Readable.from(await getFamilleMetier(bcnApi)),
    writeData(
      async (data) => {
        stats.total++;

        const formatted = {
          code: data.code,
          libelle: data.libelle,
        };

        try {
          await FamilleMetierRepository.upsert(["code"], formatted);

          logger.info(`Nouvelle famille de métiers ${Object.values(formatted).join("/")} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la famille de métiers ${Object.values(formatted).join("/")}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

async function importLienMef() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await FormationRepository.updateBy({
    familleMetierId: null,
    isAnneeCommune: null,
  });

  const bcnApi = new BCNApi();

  await oleoduc(
    await getLienFamilleMetier(bcnApi),
    transformData(async (data) => {
      const mefsData = await RawDataRepository.search(
        RawDataType.BCN_MEF,
        {
          formation_diplome: data.code_formation_diplome,
        },
        false
      );

      const isAnneeCommune = await Query.isAnneeCommune(data.code_formation_diplome);

      return mefsData
        .map((mef) => {
          return {
            mef: mef?.data as RawData[RawDataType.BCN_MEF],
            isAnneeCommune,
            data,
          };
        })
        .filter((d) => d.mef);
    }),
    flattenArray(),
    transformData(async ({ mef, isAnneeCommune, data }) => {
      const formation = await FormationRepository.first({ mef11: mef.mef_stat_11 });
      if (!formation) {
        return null;
      }

      const familleMetier = await FamilleMetierRepository.first({ code: data.code });
      if (!familleMetier) {
        logger.error(`La famille de métiers ${data.code} n'existe pas.`);
        stats.failed++;
        return null;
      }

      return { formation, familleMetier, isAnneeCommune };
    }),
    filterData((d) => d),
    writeData(
      async ({ formation, familleMetier, isAnneeCommune }) => {
        stats.total++;

        const formatted = {
          familleMetierId: familleMetier.id,
          isAnneeCommune,
        };

        try {
          await FormationRepository.updateBy(formatted, { id: formation.id });

          logger.info(`Famille de métiers ${familleMetier.code} ajoutée pour ${formation.mef11}`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter la famille de métiers ${familleMetier.code} pour ${formation.mef11}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

export async function importFamillesMetiers() {
  logger.info(`Importation des familles de métiers`);

  const statsFamilleMetier = await importFamillesMetiersListe();
  const statsLienMef = await importLienMef();
  return { statsFamilleMetier, statsLienMef };
}
