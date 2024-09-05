import { oleoduc, transformData, writeData } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import removeAccents from "remove-accents";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

async function getOldLibelle(diplome) {
  const cleanLibelle = (name) => removeAccents(name.trim());

  // Get the first different libelle
  const currentLibelle = cleanLibelle(diplome.libelle_long);
  let previous = diplome;
  while (previous.ancien_diplome.length === 1) {
    const previousRequest = await RawDataRepository.first(RawDataType.BCN, {
      code_certification: previous.ancien_diplome[0],
    });

    if (!previousRequest) {
      return null;
    }

    previous = previousRequest.data;
    const libelle = previous.libelle_long;
    const libelleClean = cleanLibelle(libelle);
    if (currentLibelle !== libelleClean && !currentLibelle.includes(libelleClean)) {
      return libelle;
    }
  }

  return null;
}

export async function importLibelle() {
  logger.info(`Importation des libelles et anciens libelles des formations`);
  const stats = { total: 0, updated: 0, failed: 0 };

  await oleoduc(
    await RawDataRepository.search(RawDataType.BCN),
    transformData(async (result) => {
      const { data } = result;
      const diplomeCfd =
        data.type === "mef"
          ? (await RawDataRepository.first(RawDataType.BCN, { code_certification: data.code_formation_diplome }))?.data
          : data;

      const newData = {
        code_certification: data.code_certification,
        libelle_long: diplomeCfd.libelle_long,
        libelle_long_ancien: await getOldLibelle(diplomeCfd),
      };

      return { result, data: newData };
    }),
    writeData(
      async ({ result, data }) => {
        stats.total++;

        try {
          await RawDataRepository.updateBy({ data: { ...result.data, ...omitNil(data) } }, { id: result.id });

          logger.info(`Libellés pour ${data.code_certification} mis à jour`);
          stats.updated++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les libellés pour la certification ${data.code_certification}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
