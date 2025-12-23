import { oleoduc, transformData, writeData } from "oleoduc";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils";
import { fromPairs } from "lodash-es";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";
import { BCNApi } from "#src/services/bcn/BCNApi.js";

const logger = getLoggerWithContext("import");

function fieldsValue(data) {
  const MEF_FIELDS_MAPPER = {
    mef: "mef",
    dispositif_formation: "dispositif_formation",
    formation_diplome: "formation_diplome",
    duree_dispositif: "duree_dispositif",
    annee_dispositif: "annee_dispositif",
    libelle_court: "libelle_court",
    libelle_long: "libelle_long",
    date_ouverture: "date_ouverture",
    date_fermeture: "date_fermeture",
    statut_mef: "statut_mef",
    nb_option_obligatoire: "nb_option_obligatoire",
    nb_option_facultatif: "nb_option_facultatif",
    renforcement_langue: "renforcement_langue",
    duree_projet: "duree_projet",
    duree_stage: "duree_stage",
    horaire: "horaire",
    mef_inscription_scolarite: "mef_inscription_scolarite",
    mef_stat_11: "mef_stat_11",
    mef_stat_9: "mef_stat_9",
    date_intervention: "date_intervention",
    libelle_edition: "libelle_edition",
    n_commentaire: "commentaire",
  };

  return fromPairs(
    Object.keys(MEF_FIELDS_MAPPER).map((k) => {
      const value = ["date_ouverture", "date_fermeture", "date_intervention"].includes(k)
        ? parseAsUTCDate(data[k])
        : data[k] !== null
        ? `${data[k]}`
        : null;
      return [MEF_FIELDS_MAPPER[k], value];
    })
  );
}

export async function importBCNMEF() {
  logger.info(`Importation des formations de la voie scolaire depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };
  const bcnApi = new BCNApi();

  await RawDataRepository.deleteAll(RawDataType.BCN_MEF);

  await oleoduc(
    await bcnApi.fetchNomenclature("N_MEF"),
    transformData(async (data) => fieldsValue(data)),
    writeData(
      async (data) => {
        stats.total++;

        try {
          await RawDataRepository.insertRaw(RawDataType.BCN_MEF, omitNil(data));

          logger.info(`Nouveau code ${data.mef_stat_11} ajouté`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'importer le code ${data.mef_stat_11}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
