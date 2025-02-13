import fs from "fs";
import { Readable } from "stream";
import { oleoduc, writeData, transformData, filterData, flattenArray } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import moment, { MONTHS_STR, parseAsUTCDate } from "#src/common/utils/dateUtils";
import { kdb } from "#src/common/db/db";
import { parseJourneesPortesOuvertes } from "#src/services/onisep/etablissement.js";
import EtablissementRepository from "#src/common/repositories/etablissement";

const logger = getLoggerWithContext("import");

export async function importEtablissementJPOScrapTmp() {
  logger.info(`Importation des dates des JPO des fiches établissements scrapper`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    Readable.from(Object.entries(JSON.parse(await fs.promises.readFile("data/jpo.json", "utf8")))),
    filterData(([_, data]) => {
      if (data.jpo.length === 0) {
        return false;
      }

      // Si la date précédentes est avant cette année scolaiure
      const match = data.jpo[0].match(/^Date\(s\) indicative\(s\) des Journées portes ouvertes précédentes : le (.*)/);
      if (match) {
        const date = moment(parseAsUTCDate(match[1]));
        if (date.isAfter(`${moment().year() - 1}-10-01`)) {
          return true;
        }
        return false;
      }

      return true;
    }),
    transformData(([ensCode, data]) => {
      const cleanDatePrec = (str) =>
        str.replace("Date(s) indicative(s) des Journées portes ouvertes précédentes : ", "");

      const replaceMonth = (str) => {
        MONTHS_STR.forEach((month_str, index) => {
          str = str.replace(` ${month_str} `, "/" + `${index + 1}`.padStart(2, "0") + "/");
        });
        return str;
      };
      return [ensCode, data.jpo.map((jpo) => replaceMonth(cleanDatePrec(jpo))).join(" | ")];
    }),
    transformData(async ([ensCode, data]) => {
      const etablissements = await EtablissementRepository.find({ onisepId: ensCode }, false);
      return etablissements.map((e) => ({
        etablissement: e,
        jpo: data,
      }));
    }),
    flattenArray(),
    writeData(
      async ({ etablissement, jpo }) => {
        try {
          const jPOParsed = parseJourneesPortesOuvertes(jpo);
          if (jPOParsed.details) {
            await EtablissementRepository.updateBy(
              {
                JPODetails: jPOParsed ? jPOParsed.details : null,
              },
              { id: etablissement.id }
            );
          }

          // Remove old JPO
          await kdb
            .deleteFrom("etablissementJPODate")
            .where("etablissementId", "=", etablissement.id)
            .executeTakeFirst();
          if (jPOParsed && jPOParsed.dates) {
            for (const date of jPOParsed.dates) {
              await kdb
                .insertInto("etablissementJPODate")
                .values({ etablissementId: etablissement.id, ...date })
                .returning(["id"])
                .executeTakeFirst();
            }
          }

          logger.info(`Etablissement ${etablissement.uai} mise à jour`);
          stats.updated++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les informations pour l'établissement  ${etablissement.uai}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
