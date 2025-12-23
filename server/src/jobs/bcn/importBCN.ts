import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { getDiplome, getNiveauxDiplome } from "#src/services/bcn/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";
import { BCNApi } from "#src/services/bcn/BCNApi.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data, niveauxDiplome) {
  const cfd = data["formation_diplome"];

  return {
    code_certification: cfd,
    code_formation_diplome: cfd,
    diplome: getDiplome(cfd, niveauxDiplome),
    date_ouverture: parseAsUTCDate(data["date_ouverture"]),
    date_fermeture: parseAsUTCDate(data["date_fermeture"]),
    ancien_diplome: [],
    nouveau_diplome: [],
  };
}

export async function streamCfds(bcnApi) {
  const niveauxDiplome = await getNiveauxDiplome(bcnApi);
  return compose(
    mergeStreams(
      await bcnApi.fetchNomenclature("V_FORMATION_DIPLOME"), //Apprentissage
      await bcnApi.fetchNomenclature("N_FORMATION_DIPLOME"),
      await bcnApi.fetchNomenclature("N_FORMATION_DIPLOME_ENQUETE_51")
    ),
    transformData(async (data) => {
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "cfd",
        libelle: `${data["libelle_court"]} ${data["libelle_stat_33"]}`,
        libelle_long: data["libelle_long_200"],
        niveauFormationDiplome: data["niveau_formation_diplome"],
        groupeSpecialite: data["groupe_specialite"],
        lettreSpecialite: data["lettre_specialite"],
      };
    })
  );
}

export async function streamMefs(bcnApi) {
  const niveauxDiplome = await getNiveauxDiplome(bcnApi);
  const stream = await bcnApi.fetchNomenclature("N_MEF");

  return compose(
    stream,
    transformData(async (data) => {
      const mefstat11 = data["mef_stat_11"];
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "mef",
        code_certification: mefstat11,
        libelle: data["libelle_long"],
        libelle_long: data["libelle_long"],
      };
    })
  );
}

async function importFromStream(stream, stats = { total: 0, created: 0, updated: 0, failed: 0 }) {
  await oleoduc(
    stream,
    writeData(
      async (data) => {
        stats.total++;

        if (!data.diplome) {
          logger.warn(`Diplome inconnu pour le code ${data.code_certification}`);
        }

        try {
          const exists = await RawDataRepository.firstForType(RawDataType.BCN, {
            code_certification: data.code_certification,
          });

          if (exists) {
            await RawDataRepository.update(RawDataType.BCN, omitNil(data), {
              code_certification: data.code_certification,
            });
            logger.info(`Code ${data.code_certification} mis à jour`);
          } else {
            await RawDataRepository.insertRaw(RawDataType.BCN, omitNil(data));
            logger.info(`Nouveau code ${data.code_certification} ajouté`);
          }

          stats.created++;
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

export async function importBCN() {
  logger.info(`Importation des formations depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const bcnApi = new BCNApi();

  // Remove old data
  await RawDataRepository.deleteAll(RawDataType.BCN);

  await importFromStream(await streamCfds(bcnApi), stats);
  await importFromStream(await streamMefs(bcnApi), stats);

  return stats;
}
