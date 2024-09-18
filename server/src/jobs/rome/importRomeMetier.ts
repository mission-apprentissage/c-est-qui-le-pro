import { oleoduc, writeData, filterData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { isRomeValid, romeMetierFromCsv } from "#src/services/rome";
import RomeMetierRepository from "#src/common/repositories/romeMetier";

const logger = getLoggerWithContext("import");

export async function importRomeMetier(options = { romeMetierFile: null }) {
  logger.info(`Importation des métiers des ROMEs`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const romeMetierFile = options.romeMetierFile || null;

  await oleoduc(
    await romeMetierFromCsv(romeMetierFile),
    filterData((data) => {
      if (!isRomeValid(data["Code ROME"])) {
        logger.error(`Le code rome ${data["Code ROME"]} n'est pas valide.`);
        stats.failed++;
        return false;
      }
      return true;
    }),
    transformData((data) => {
      const strToBoolean = (str: string) => (str === "Oui" ? true : false);
      return {
        rome: data["Code ROME"],
        libelle: data["libellé métier onisep"] || data["Lib_ROME_FT"],
        onisepLibelle: data["libellé métier onisep"],
        onisepLink: data["lien site onisep.fr"],
        franceTravailLibelle: data["Lib_ROME_FT"],
        franceTravailLink: data["lien site FT"],
        transitionEcologique: strToBoolean(data["transitionEcologique"]),
        transitionEcologiqueDetaillee: data["transitionEcologiqueDetaillee"],
        transitionNumerique: strToBoolean(data["transitionNumerique"]),
        transitionDemographique: strToBoolean(data["transitionDemographique"]),
      };
    }),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await RomeMetierRepository.upsert(["rome", "libelle"], data);

          logger.info(`Nouveau métier ${data.rome}/${data.libelle} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter le métier ${data.rome}/${data.libelle}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
