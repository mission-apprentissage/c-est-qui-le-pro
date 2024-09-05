import { oleoduc, transformData, writeData, filterData } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { concat, omit, uniq } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

async function updateDiplomeList(data) {
  const bcnData = await RawDataRepository.first(RawDataType.BCN, { code_certification: data.code_certification });
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
      const bcnOld = await RawDataRepository.first(RawDataType.BCN, {
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
      const bcnNew = await RawDataRepository.first(RawDataType.BCN, {
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

async function getMefFromCfd(cfd, parentMef) {
  const result = (
    await RawDataRepository.search(
      RawDataType.BCN_MEF,
      {
        formation_diplome: cfd,
        dispositif_formation: parentMef.dispositif_formation,
      },
      false
    )
  )
    .map(({ data }) => data)
    .find(({ mef_stat_11 }) => mef_stat_11.substr(0, 4) === parentMef.mef_stat_11.substr(0, 4));

  return result;
}

export async function computeBCNMEFContinuum() {
  logger.info(`Création du continuum pour la voie scolaire (MEFSTAT11)`);
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    await RawDataRepository.search(RawDataType.BCN, {
      type: "mef",
    }),
    transformData(async ({ data }) => {
      // Get CFD and Mef
      const diplomeCfdResult = await RawDataRepository.first(RawDataType.BCN, {
        code_certification: data.code_formation_diplome,
      });
      const diplomeCfd = diplomeCfdResult.data as RawData[RawDataType.BCN];

      const diplomeMefRequest = await RawDataRepository.first(RawDataType.BCN_MEF, {
        mef_stat_11: data.code_certification,
      });
      const diplomeMef = diplomeMefRequest ? (diplomeMefRequest.data as RawData[RawDataType.BCN_MEF]) : null;

      if (!diplomeMef) {
        logger.error(`Le diplome ${data.code_certification} n'existe pas dans la table Mef`);
        return null;
      }

      // Get old MEFs
      const oldMefs = await Promise.all(diplomeCfd.ancien_diplome.map((oldCfd) => getMefFromCfd(oldCfd, diplomeMef)));

      // Get new MEFs
      const newMefs = await Promise.all(diplomeCfd.nouveau_diplome.map((newCfd) => getMefFromCfd(newCfd, diplomeMef)));

      const newData = {
        code_certification: data.code_certification,
        date_premiere_session: diplomeCfd.date_premiere_session,
        date_derniere_session: diplomeCfd.date_derniere_session,
        ancien_diplome: omitNil(oldMefs).map((d) => d.mef_stat_11),
        nouveau_diplome: omitNil(newMefs).map((d) => d.mef_stat_11),
      };

      return newData;
    }),
    filterData((v) => v),
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
