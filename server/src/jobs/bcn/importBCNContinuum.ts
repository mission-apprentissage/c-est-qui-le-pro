import { oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable } from "#src/services/bcn.js";
import { concat, omit, uniq } from "lodash-es";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

async function updateDiplomeList(data) {
  const bcnData = await RawDataRepository.firstForType(RawDataType.BCN, {
    code_certification: data.code_certification,
  });
  if (bcnData) {
    const bcnDataData = bcnData.data as RawData[RawDataType.BCN];
    await RawDataRepository.updateBy(
      {
        data: JSON.stringify({
          ...bcnDataData,
          ...omitNil(omit(data, "ancien_diplome", "nouveau_diplome")),
          ancien_diplome: uniq(concat(bcnDataData.ancien_diplome || [], data.ancien_diplome || [])),
          nouveau_diplome: uniq(concat(bcnDataData.nouveau_diplome || [], data.nouveau_diplome || [])),
        }),
      },
      {
        id: bcnData.id as any,
      }
    );
  }

  if (data.ancien_diplome?.length > 0) {
    for (const ancien_diplome of data.ancien_diplome) {
      const bcnOld = await RawDataRepository.firstForType(RawDataType.BCN, {
        code_certification: ancien_diplome,
      });

      if (bcnOld) {
        const bcnOldData = bcnOld.data as RawData[RawDataType.BCN];
        await RawDataRepository.updateBy(
          {
            data: JSON.stringify({
              ...bcnOldData,
              nouveau_diplome: uniq(concat(bcnOldData.nouveau_diplome || [], [data.code_certification])),
            }),
          },
          {
            id: bcnOld.id as any,
          }
        );
      }
    }
  }

  if (data.nouveau_diplome?.length > 0) {
    for (const nouveau_diplome of data.nouveau_diplome) {
      const bcnNew = await RawDataRepository.firstForType(RawDataType.BCN, {
        code_certification: nouveau_diplome,
      });

      if (bcnNew) {
        const bcnNewData = bcnNew.data as RawData[RawDataType.BCN];
        await RawDataRepository.updateBy(
          {
            data: JSON.stringify({
              ...bcnNewData,
              ancien_diplome: uniq(concat(bcnNewData.ancien_diplome || [], [data.code_certification])),
            }),
          },
          {
            id: bcnNew.id as any,
          }
        );
      }
    }
  }
}

export async function importBCNContinuum(options = {}) {
  logger.info(`Création du continuum des formations depuis la BCN`);
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    await getBCNTable("N_FORMATION_DIPLOME", options),
    transformData((data) => {
      const parseDiplomeList = (match, data) => {
        const list = Object.keys(data)
          .filter((key) => key.startsWith(match))
          .map((key) => data[key]);
        return list;
      };

      const newData = {
        code_certification: data["FORMATION_DIPLOME"],
        date_premiere_session: data["DATE_PREMIERE_SESSION"] || null,
        date_derniere_session: data["DATE_DERNIERE_SESSION"] || null,
      };

      return {
        ...newData,
        ancien_diplome: parseDiplomeList("ANCIEN_DIPLOME_", data).filter((c) => c != newData.code_certification),
        nouveau_diplome: parseDiplomeList("NOUVEAU_DIPLOME_", data).filter((c) => c != newData.code_certification),
      };
    }),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await updateDiplomeList(data);
          logger.info(`Continuum pour ${data.code_certification}`);
          stats.updated++;
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
