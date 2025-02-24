import { oleoduc, writeData, transformData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import RomeMetierRepository from "#src/common/repositories/romeMetier";
import RomeRepository from "#src/common/repositories/rome.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData.js";

const logger = getLoggerWithContext("import");

export async function importRomeMetier() {
  logger.info(`Importation des métiers des ROMEs`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await RomeRepository.getAll(),
    transformData(async (rome) => {
      const franceTravailData = (
        await RawDataRepository.firstForType(RawDataType.FRANCE_TRAVAIL_metiers, {
          code: rome.rome,
        })
      )?.data as RawData[RawDataType.FRANCE_TRAVAIL_metiers];
      if (!franceTravailData) {
        logger.error(`Code rome ${rome.rome} inconnu dans la base rome france travail`);
        stats.failed++;
        return null;
      }

      const onisepDatas = (
        await RawDataRepository.search(
          RawDataType.ONISEP_ideoMetiers,
          {
            data: { code_rome: rome.rome },
          },
          false
        )
      ).map((data) => data.data.data);

      return onisepDatas.length > 0
        ? onisepDatas.map((onisepData) => ({
            rome,
            franceTravailData,
            onisepData,
          }))
        : [{ rome, franceTravailData, onisepData: null }];
    }),
    flattenArray(),
    transformData(({ rome, franceTravailData, onisepData }) => {
      return {
        rome: rome.rome,
        libelle: onisepData?.libelle_metier || franceTravailData.libelle,
        onisepLibelle: onisepData?.libelle_metier,
        onisepLink: onisepData?.lien_site_onisepfr,
        franceTravailLibelle: franceTravailData.libelle,
        franceTravailLink: `https://candidat.francetravail.fr/metierscope/fiche-metier/${rome.rome}`,
        transitionEcologique: franceTravailData.transitionEcologique || false,
        transitionEcologiqueDetaillee: franceTravailData.transitionEcologiqueDetaillee || null,
        transitionNumerique: franceTravailData.transitionNumerique || false,
        transitionDemographique: franceTravailData.transitionDemographique || false,
      };
    }),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await RomeMetierRepository.upsert(["rome", "libelle"], data, data);

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
