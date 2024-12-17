import { oleoduc, writeData, transformData, compose, filterData, flattenArray } from "oleoduc";
import { isNil } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import { parseCsv } from "#src/common/utils/csvUtils.js";
import { createReadStream } from "fs";
import config from "#src/config.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import { kdb, upsert } from "#src/common/db/db";
import { cfdsParentAndChildren } from "#src/queries/cfdsParentAndChildren.js";
import IndicateurEntreeRepository from "#src/common/repositories/indicateurEntree";

const logger = getLoggerWithContext("import");

function parseExportOrion(filePath) {
  const stream = compose(createReadStream(filePath));
  return compose(
    stream,
    parseCsv({
      delimiter: ";",
      quote: null,
      cast: (value) => {
        if (typeof value === "number") {
          return value;
        }

        // Parse field with excel format "=""VALUE"""
        const match = value.match(/"=""(.*)"""/);
        if (!match) {
          return value;
        }
        return match[1];
      },
    })
  );
}

export async function importIndicateurEntree(options = { exportEtablissementsOrionFilePath: null }) {
  logger.info(`Importation des indicateurs d'entrées depuis orion`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const exportEtablissementsOrionFilePath =
    options.exportEtablissementsOrionFilePath || config.orion.files.exportEtablissements;

  const formatInt = (v) => (isNil(v) ? null : parseInt(v));
  const formatFloat = (v) => (isNil(v) ? null : parseFloat(v.replace(",", ".")));

  await oleoduc(
    parseExportOrion(exportEtablissementsOrionFilePath),
    // Continuum
    transformData(async (data) => {
      const cfds = await cfdsParentAndChildren(data["Code formation diplôme"]);

      return cfds.map((cfd) => ({
        ...data,
        "Code formation diplôme": cfd,
      }));
    }),
    flattenArray(),
    transformData(async (data) => {
      const cfd = data["Code formation diplôme"];
      const uai = data["UAI"];
      const codeDispositif = data["Code dispositif"];

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
        const effectifsAnnee = (formation.familleMetierId ? ["1", "2"] : ["1"])
          .filter((a) => data[`Année ${a}`] !== undefined)
          .find((_) => true);

        const indicateurEntree = {
          formationEtablissementId: formationEtablissement.id,
          rentreeScolaire: data["RS"],
          capacite: formatInt(data["Capacité"]),
          premiersVoeux: formatInt(data["Nb de premiers voeux"]),
          effectifs: effectifsAnnee ? formatInt(data[`Année ${effectifsAnnee}`]) : null,
          effectifsAnnee,
          tauxPression: formatFloat(data["Tx de pression"]),
        };

        try {
          // Vérifie qu'il n'existe pas déjà un effectif pour une année antérieur
          const previousYearExist = await IndicateurEntreeRepository.first({
            formationEtablissementId: indicateurEntree.formationEtablissementId,
            rentreeScolaire: indicateurEntree.rentreeScolaire,
          });
          if (
            previousYearExist &&
            previousYearExist.effectifsAnnee !== null &&
            previousYearExist.effectifs !== null &&
            previousYearExist.effectifsAnnee < indicateurEntree.effectifsAnnee
          ) {
            return;
          }

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
