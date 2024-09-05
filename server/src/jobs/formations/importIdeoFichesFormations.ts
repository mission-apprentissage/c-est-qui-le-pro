import { oleoduc, writeData, filterData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { streamIdeoFichesFormations } from "#src/services/onisep/fichesFormations.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { kdb } from "#src/common/db/db";

const logger = getLoggerWithContext("import");

async function cfdsParentAndChildren(cfd) {
  const cfds = [cfd];

  let diplomeBCNBase = (await RawDataRepository.first(RawDataType.BCN, { code_certification: cfd }))
    ?.data as RawData[RawDataType.BCN];
  if (!diplomeBCNBase) {
    return cfds;
  }

  let diplomeBCN = diplomeBCNBase;
  let parents = diplomeBCN.ancien_diplome;
  // Support only 1 to 1 case
  while (parents && parents.length == 1) {
    cfds.push(parents[0]);
    diplomeBCN = (await RawDataRepository.first(RawDataType.BCN, { code_certification: parents[0] }))
      ?.data as RawData[RawDataType.BCN];

    parents = diplomeBCN?.ancien_diplome;
  }

  diplomeBCN = diplomeBCNBase;
  let children = diplomeBCN.nouveau_diplome;
  // Support only 1 to 1 case
  while (children && children.length == 1) {
    cfds.push(children[0]);
    diplomeBCN = (await RawDataRepository.first(RawDataType.BCN, { code_certification: children[0] }))
      ?.data as RawData[RawDataType.BCN];

    children = diplomeBCN?.nouveau_diplome;
  }

  return cfds;
}

export async function importIdeoFichesFormations() {
  logger.info(`Importation des données des fiches de formations Idéo`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const cleanDescription = (text) => {
    return text.replaceAll(/<p>[\s]+<\/p>/g, "");
  };
  await oleoduc(
    await streamIdeoFichesFormations(),
    filterData((data) => data.code_scolarite && data.descriptif_format_court),
    transformData(async (formation) => {
      const cfds = await cfdsParentAndChildren(formation.code_scolarite);
      return { cfds, formation };
    }),
    writeData(
      async ({ cfds, formation }) => {
        try {
          const result = await kdb
            .updateTable("formation")
            .set({
              description: cleanDescription(formation.descriptif_format_court),
              onisepIdentifiant: formation.identifiant,
            })
            .where("cfd", "in", cfds)
            .returning("id")
            .execute();

          if (result && result.length > 0) {
            logger.info(`Formation(s) ${cfds.join(",")} mise(s) à jour`);
            stats.updated++;
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les informations de formation(s) ${cfds.join(",")}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
