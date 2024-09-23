import { oleoduc, transformData, writeData } from "oleoduc";
import { getBCNTable } from "#src/services/bcn.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseAsUTCDate } from "#src/common/utils/dateUtils.js";
import { fromPairs } from "lodash-es";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

const logger = getLoggerWithContext("import");

function fieldsValue(data) {
  const MEF_FIELDS_MAPPER = {
    MEF: "mef",
    DISPOSITIF_FORMATION: "dispositif_formation",
    FORMATION_DIPLOME: "formation_diplome",
    DUREE_DISPOSITIF: "duree_dispositif",
    ANNEE_DISPOSITIF: "annee_dispositif",
    LIBELLE_COURT: "libelle_court",
    LIBELLE_LONG: "libelle_long",
    DATE_OUVERTURE: "date_ouverture",
    DATE_FERMETURE: "date_fermeture",
    STATUT_MEF: "statut_mef",
    NB_OPTION_OBLIGATOIRE: "nb_option_obligatoire",
    NB_OPTION_FACULTATIF: "nb_option_facultatif",
    RENFORCEMENT_LANGUE: "renforcement_langue",
    DUREE_PROJET: "duree_projet",
    DUREE_STAGE: "duree_stage",
    HORAIRE: "horaire",
    MEF_INSCRIPTION_SCOLARITE: "mef_inscription_scolarite",
    MEF_STAT_11: "mef_stat_11",
    MEF_STAT_9: "mef_stat_9",
    DATE_INTERVENTION: "date_intervention",
    LIBELLE_EDITION: "libelle_edition",
    N_COMMENTAIRE: "commentaire",
  };

  return fromPairs(
    Object.keys(MEF_FIELDS_MAPPER).map((k) => {
      const value = ["DATE_OUVERTURE", "DATE_FERMETURE", "DATE_INTERVENTION"].includes(k)
        ? parseAsUTCDate(data[k])
        : data[k];
      return [MEF_FIELDS_MAPPER[k], value];
    })
  );
}

export async function importBCNMEF(options = {}) {
  logger.info(`Importation des formations de la voie scolaire depuis la BCN`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await RawDataRepository.deleteAll(RawDataType.BCN_MEF);

  await oleoduc(
    await getBCNTable("N_MEF", options),
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
