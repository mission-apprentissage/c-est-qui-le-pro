import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { Formation } from "#src/common/db/schema.js";
import FormationRomeRepository from "#src/common/repositories/formationRome.js";
import FormationRepository from "#src/common/repositories/formation.js";
import RomeRepository from "#src/common/repositories/rome.js";
import { cfdsParentAndChildren } from "#src/queries/cfdsParentAndChildren.js";

const logger = getLoggerWithContext("import");

async function importCode() {
  logger.info(`Importation des données des Formacodes dans les formations`);
  const stats = { total: 0, created: 0, failed: 0 };

  await oleoduc(
    await FormationRepository.find({}),
    transformData(async (formation) => {
      const cfds = await cfdsParentAndChildren(formation.cfd);
      return { cfds, formation };
    }),
    transformData(async ({ cfds, formation }) => {
      for (const cfd of cfds) {
        const certifInfo = await RawDataRepository.firstForType(RawDataType.RCO_certifInfo, {
          data: {
            "Code scolarité": cfd,
          },
        });

        if (certifInfo) {
          return { certifInfo: (certifInfo.data as RawData[RawDataType.RCO_certifInfo]).data, formation, cfd, cfds };
        }
      }

      logger.warn(`Aucune entrée Certif Info pour ${formation.cfd}.`);
      return null;
    }),
    transformData(async ({ certifInfo, formation }) => {
      // Récupération des données certif info pour le code le plus récent
      while (certifInfo["Code Certifinfo remplaçant"]) {
        const codes = certifInfo["Code Certifinfo remplaçant"].split(",");
        if (codes.length > 1) {
          break;
        }

        const certifInfoNew = (
          (
            await RawDataRepository.firstForType(RawDataType.RCO_certifInfo, {
              data: {
                "Code Certifinfo": certifInfo["Code Certifinfo remplaçant"],
              },
            })
          )?.data as RawData[RawDataType.RCO_certifInfo]
        )?.data;

        if (!certifInfoNew) {
          break;
        }

        certifInfo = certifInfoNew;
      }
      return { certifInfo, formation };
    }),
    writeData(async ({ certifInfo, formation }) => {
      if (!certifInfo["Formacode principal"]) {
        logger.warn(`Aucun Formacode pour ${formation.cfd}.`);
        return;
      }

      try {
        stats.total++;

        await FormationRepository.updateBy(
          {
            formacode: certifInfo["Formacode principal"],
          },
          {
            cfd: formation.cfd,
          }
        );

        logger.info(`Données des RCO pour ${formation.cfd} ajoutées`);
        stats.created++;
      } catch (e) {
        logger.error(e, `Impossible d'ajouter les données des RCO pour ${formation.cfd}`);
        stats.failed++;
      }
    })
  );

  return stats;
}

async function importRome() {
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

export async function importRCO() {
  const statsCode = await importCode();
  const statsRome = await importRome();
  return { statsCode, statsRome };
}
