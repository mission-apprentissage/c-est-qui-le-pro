import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { Formation } from "#src/common/db/schema.js";
import FormationRomeRepository from "#src/common/repositories/formationRome.js";
import FormationRepository from "#src/common/repositories/formation.js";
import RomeRepository from "#src/common/repositories/rome";

const logger = getLoggerWithContext("import");

export async function importRCO() {
  logger.info(`Importation des données des RCO (ROME)`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const romes = await RomeRepository.getAll(false);

  // Clean old ROME
  await FormationRomeRepository.remove({});

  await oleoduc(
    await RawDataRepository.search(RawDataType.RCO_certifInfo),
    filterData((data) => data?.data?.data["Code scolarité"]),
    transformData(async (data) => {
      const formations = await FormationRepository.find(
        {
          cfd: data.data.data["Code scolarité"],
        },
        false
      );
      return formations.map((formation) => ({ certifInfo: data.data.data, formation }));
    }),
    flattenArray(),
    filterData(({ formation }) => formation),
    transformData(
      async ({
        formation,
        certifInfo,
      }: {
        formation: Formation;
        certifInfo: RawData[RawDataType.RCO_certifInfo]["data"];
      }) => {
        const certifInfoRomes = (
          await (
            await RawDataRepository.search(RawDataType.RCO_certificationRome, {
              data: { ["Code Certifinfo"]: certifInfo["Code Certifinfo"] },
            })
          ).toArray()
        )
          .map((data) => data?.data?.data["Code Rome"])
          .filter((d) => d)
          .filter((d) => {
            if (romes.find((r) => r.rome === d)) {
              return true;
            }
            logger.error(`Le code rome ${d} n'existe pas.`);
            return false;
          });

        return { formation, certifInfo, certifInfoRomes };
      }
    ),
    filterData(({ certifInfoRomes }) => certifInfoRomes.length > 0),
    writeData(
      async (data) => {
        try {
          for (const rome of data.certifInfoRomes) {
            await FormationRomeRepository.upsert(["rome", "formationId"], {
              rome: rome,
              formationId: data.formation.id,
            });
          }

          logger.info(`Données des RCO pour ${data.formation.cfd} ajoutées`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données des RCO pour ${data.formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
