import { oleoduc, writeData, transformData, filterData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import config from "#src/config.js";
import { familleMetierFromCsv, lienMefFamilleMetierFromCsv } from "#src/services/bcn";
import FamilleMetierRepository from "#src/common/repositories/familleMetier";
import FormationRepository from "#src/common/repositories/formation.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData.js";

const logger = getLoggerWithContext("import");

async function importFamillesMetiersListe(familleMetierFilePath) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    familleMetierFromCsv(familleMetierFilePath),
    writeData(
      async (data) => {
        stats.total++;

        const formatted = {
          code: data["FAMILLE_METIER"],
          libelle: data["LIBELLE_EDITION"],
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

async function importLienMef(lienMefFamilleMetierFilePath) {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await FormationRepository.updateBy({
    familleMetierId: null,
    isAnneeCommune: null,
  });

  await oleoduc(
    lienMefFamilleMetierFromCsv(lienMefFamilleMetierFilePath),
    transformData(async (data) => {
      const mefData = (
        await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
          mef: data["MEF"],
        })
      )?.data as RawData[RawDataType.BCN_MEF];

      if (!mefData) {
        return null;
      }

      const formation = await FormationRepository.first({ mef11: mefData.mef_stat_11 });
      if (!formation) {
        return null;
      }

      const familleMetier = await FamilleMetierRepository.first({ code: data["FAMILLE_METIER"] });
      if (!familleMetier) {
        logger.error(`La famille de métiers ${data["FAMILLE_METIER"]} n'existe pas.`);
        stats.failed++;
        return null;
      }

      return { formation, familleMetier };
    }),
    filterData((d) => d),
    writeData(
      async ({ formation, familleMetier }) => {
        stats.total++;

        const formatted = {
          familleMetierId: familleMetier.id,
          isAnneeCommune: formation.mef11[3] === "1", // On prend la 1ère année = seconde commune
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

export async function importFamillesMetiers(
  options = { familleMetierFilePath: null, lienMefFamilleMetierFilePath: null }
) {
  logger.info(`Importation des familles de métiers`);

  const familleMetierFilePath = options.familleMetierFilePath || config.bcn.files.familleMetier;
  const lienMefFamilleMetierFilePath = options.lienMefFamilleMetierFilePath || config.bcn.files.lienMefFamilleMetier;

  const statsFamilleMetier = await importFamillesMetiersListe(familleMetierFilePath);
  const statsLienMef = await importLienMef(lienMefFamilleMetierFilePath);
  return { statsFamilleMetier, statsLienMef };
}
