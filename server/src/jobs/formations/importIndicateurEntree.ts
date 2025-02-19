import { oleoduc, writeData, transformData, compose, filterData, flattenArray } from "oleoduc";
import { isNil } from "lodash-es";
import AutoDetectDecoderStream from "autodetect-decoder-stream";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import { kdb, upsert } from "#src/common/db/db";
import { cfdsParentAndChildren } from "#src/queries/cfdsParentAndChildren.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData.js";

const logger = getLoggerWithContext("import");

function parseVoeux(filePath) {
  const stream = compose(createReadStream(filePath), new AutoDetectDecoderStream());
  return compose(
    stream,
    parseCsv({
      delimiter: ";",
      from_line: 2,
    })
  );
}

export async function importIndicateurEntree(options = { voeuxFilePath: null }) {
  logger.info(`Importation des indicateurs d'entrées depuis les voeux`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const voeuxFilePath = options.voeuxFilePath || config.affelnet.files.voeux;
  const voeuxAnneeRentree = config.affelnet.voeuxAnneeRentree;

  const formatInt = (v) => (isNil(v) || v === "NA" ? null : parseInt(v));
  const formatFloat = (v) => (isNil(v) || v === "NA" ? null : parseFloat(v.replace(",", ".")));

  await oleoduc(
    parseVoeux(voeuxFilePath),

    filterData((data) => data["diffusion"] === "Diffusable"),
    // CFD + Code dispositif
    transformData(async (data) => {
      const bcnMef = await ((
        await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
          mef_stat_11: data["MEF STAT 11"],
        })
      )?.data as RawData[RawDataType.BCN_MEF]);

      return { bcnMef, data };
    }),
    filterData(({ bcnMef }) => bcnMef),
    // Continuum
    transformData(async ({ bcnMef, data }) => {
      const cfds = await cfdsParentAndChildren(bcnMef.formation_diplome);

      return cfds.map((cfd) => ({
        ...data,
        dispositif_formation: bcnMef["dispositif_formation"],
        cfd: cfd,
      }));
    }),
    flattenArray(),
    transformData(async (data) => {
      const cfd = data.cfd;
      const uai = data["Etablissement d'accueil"];
      const codeDispositif = data.dispositif_formation;

      const formationEtablissement = await FormationEtablissementRepository.getFromCfd({
        uai,
        cfd,
        codeDispositif,
        voie: "scolaire",
      });

      if (!formationEtablissement) {
        logger.debug(`Aucune formation pour le CFD : ${cfd}, Code dispositif: ${codeDispositif}, UAI: ${uai}`);
        return null;
      }

      return {
        formationEtablissement,
        data,
      };
    }),
    filterData((data) => data),
    writeData(
      async ({ formationEtablissement: { formationEtablissement, formation, etablissement }, data }) => {
        const indicateurEntree = {
          formationEtablissementId: formationEtablissement.id,
          rentreeScolaire: voeuxAnneeRentree,
          capacite: formatInt(data["Capacité carte scolaire"]),
          premiersVoeux: formatInt(data["Demandes vœux 1  - TOTAL"]),
          voeux: formatInt(data["Demandes tous vœux - TOTAL"]),
          effectifs: formatInt(data[`Affectés tous vœux`]),
          tauxPression: formatFloat(data["Taux de pression (Total demandes vœux 1 / Capacité carte scolaire)"]),
        };

        try {
          await upsert(
            kdb,
            "indicateurEntree",
            ["formationEtablissementId", "rentreeScolaire"],
            indicateurEntree,
            indicateurEntree,
            ["id"]
          );

          logger.info(`Indicateur de formation ${etablissement.uai}/${formation.cfd} ajoutée`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les indicateurs de la formation ${etablissement.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
