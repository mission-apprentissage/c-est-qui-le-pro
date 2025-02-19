import cloudscraper from "cloudscraper";
import parser from "node-html-parser";
import { oleoduc, writeData, transformData, filterData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import moment, { MONTHS_STR, parseAsUTCDate } from "#src/common/utils/dateUtils";
import { kdb } from "#src/common/db/db";
import { parseJourneesPortesOuvertes } from "#src/services/onisep/etablissement.js";
import EtablissementRepository from "#src/common/repositories/etablissement";

const logger = getLoggerWithContext("import");

async function scrapJPO(etablissement) {
  const regexUAI = /Code UAI\s:\s(.*)/;
  const { onisepId } = etablissement;

  try {
    const page = await cloudscraper({
      method: "GET",
      url: `https://onisep.fr/http/redirection/etablissement/slug/${onisepId}`,
      followAllRedirects: false,
      followRedirect: (response) => {
        return response.statusCode !== 302;
      },
    });
    const fiche = parser.parse(page);

    const hasUAI = fiche.querySelectorAll(".callout-text").find((elt) => elt.textContent.match(regexUAI));
    if (!hasUAI) {
      logger.error(`Erreur lors du scraping de l'établissement ${onisepId}`);
      return null;
    }

    const jpos = [];
    const jposElt = fiche.querySelectorAll("#events .mb-3w");
    for (const jpoElt of jposElt) {
      const jpoInfo = jpoElt.querySelector(".callout-text")?.removeWhitespace().innerText.trim();
      if (!jpoInfo) {
        continue;
      }
      const jpoDetails = jpoElt
        .querySelectorAll(".callout-text:not(:first-child)")
        .map((elt) => elt.removeWhitespace().innerText.trim());
      jpos.push({
        info: jpoInfo,
        details: jpoDetails,
        full: `${jpoInfo}${jpoDetails && jpoDetails.length > 0 ? ` (${jpoDetails.join(", ")})` : ""}`,
      });
    }

    if (jpos.length === 0) {
      return null;
    }

    return jpos;
  } catch (err) {
    if (err.name === "StatusCodeError" && err.response.statusCode === 302) {
      // L'établissement n'exite plus sur l'Onisep
      logger.error(`L'établissement ${onisepId} n'existe pas/plus sur l'Onisep`);
    } else {
      logger.error(`Erreur lors du scraping de l'établissement ${onisepId}`, err.name, err?.response?.statusCode);
    }
  }
  return null;
}

export async function importEtablissementJPOScrapTmp() {
  logger.info(`Importation des dates des JPO des fiches établissements scrapper`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await EtablissementRepository.find({ hasFormation: true }),
    filterData((etablissement) => etablissement.onisepId),
    transformData(async (etablissement) => {
      const etablissementWithData = await EtablissementRepository.get({ uai: etablissement.uai });
      return etablissementWithData;
    }),
    // Filter etablissement with JPO
    filterData((etablissement) => !etablissement.JPODetails && !etablissement.JPODates),
    // Scrap from Onisep
    transformData(async (etablissement) => ({ etablissement, jpos: await scrapJPO(etablissement) })),
    filterData(({ jpos }) => jpos),
    filterData(({ _, jpos }) => {
      // Si la date précédentes est avant cette année scolaire
      const match = jpos[0].full.match(/^Date\(s\) indicative\(s\) des Journées portes ouvertes précédentes : le (.*)/);
      if (match) {
        const date = moment(parseAsUTCDate(match[1]));
        if (date.isAfter(`${moment().year() - 1}-10-01`)) {
          return true;
        }
        return false;
      }

      return true;
    }),
    transformData(({ etablissement, jpos }) => {
      const cleanDatePrec = (str) =>
        str.replace("Date(s) indicative(s) des Journées portes ouvertes précédentes : ", "");

      const replaceMonth = (str) => {
        MONTHS_STR.forEach((month_str, index) => {
          str = str.replace(` ${month_str} `, "/" + `${index + 1}`.padStart(2, "0") + "/");
        });
        return str;
      };
      return { etablissement, jpos: jpos.map((jpo) => replaceMonth(cleanDatePrec(jpo.full))).join(" | ") };
    }),
    writeData(
      async ({ etablissement, jpos }) => {
        try {
          const jPOParsed = parseJourneesPortesOuvertes(jpos);
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
