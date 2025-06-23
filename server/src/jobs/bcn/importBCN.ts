import { compose, mergeStreams, oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable, getDiplome, getNiveauxDiplome } from "#src/services/bcn";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

function fieldsValue(data, niveauxDiplome) {
  const cfd = data["FORMATION_DIPLOME"];

  return {
    code_certification: cfd,
    code_formation_diplome: cfd,
    diplome: getDiplome(cfd, niveauxDiplome),
    date_ouverture: parseAsUTCDate(data["DATE_OUVERTURE"]),
    date_fermeture: parseAsUTCDate(data["DATE_FERMETURE"]),
    ancien_diplome: [],
    nouveau_diplome: [],
  };
}

export async function streamCfds(options = {}) {
  const niveauxDiplome = await getNiveauxDiplome(options);

  return compose(
    mergeStreams(
      await getBCNTable("V_FORMATION_DIPLOME", options), //Apprentissage
      await getBCNTable("N_FORMATION_DIPLOME", options),
      await getBCNTable("N_FORMATION_DIPLOME_ENQUETE_51", options)
    ),
    transformData(async (data) => {
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "cfd",
        libelle: `${data["LIBELLE_COURT"]} ${data["LIBELLE_STAT_33"]}`,
        libelle_long: data["LIBELLE_LONG_200"],
        niveauFormationDiplome: data["NIVEAU_FORMATION_DIPLOME"],
        groupeSpecialite: data["GROUPE_SPECIALITE"],
        lettreSpecialite: data["LETTRE_SPECIALITE"],
      };
    })
  );
}

export async function streamMefs(options = {}) {
  const niveauxDiplome = await getNiveauxDiplome(options);
  const stream = await getBCNTable("N_MEF", options);

  return compose(
    stream,
    transformData(async (data) => {
      const mefstat11 = data["MEF_STAT_11"];
      return {
        ...fieldsValue(data, niveauxDiplome),
        type: "mef",
        code_certification: mefstat11,
        libelle: data["LIBELLE_LONG"],
        libelle_long: data["LIBELLE_LONG"],
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

export async function importBCN(options = {}) {
  logger.info(`Importation des formations depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  // Remove old data
  await RawDataRepository.deleteAll(RawDataType.BCN);

  await importFromStream(await streamCfds(options), stats);
  await importFromStream(await streamMefs(options), stats);

  return stats;
}
