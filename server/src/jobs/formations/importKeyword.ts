import { oleoduc, writeData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationKeywordRepository from "#src/common/repositories/formationKeyword.js";
import FormationRepository from "#src/common/repositories/formation.js";
import fs from "fs";
import config from "#src/config.js";
import diacritics from "diacritics";
import streamJson from "stream-json";
import streamers from "stream-json/streamers/StreamArray.js";

const logger = getLoggerWithContext("import");

function formatLibelle(libelle) {
  return libelle
    .replaceAll(/^(CAP |CAPA |BT |BP |bac pro |bac pro ag |classe de seconde professionnelle )/gi, "")
    .replaceAll(/\((.*)\)$/g, "");
}

async function importKeywordFile() {
  logger.info(`Importation des mot clés de formations généré`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const keywordsToRemove = [
    "eleve",
    "elever",
    "apprendre",
    "cap",
    "technique",
    "formation",
    "enseignement",
    "professionnel",
    "bac",
    "preparer",
    "competence",
    "diplome",
    "cours",
    "travail",
    "connaissance",
    "titulaire",
    "bp",
    "travailler",
    "baccalaureat",
    "pro",
  ];

  await oleoduc(
    fs.createReadStream(config.keywords.file),
    streamJson.parser(),
    streamers.streamArray(),
    transformData((data) => data.value),
    transformData(async (data) => {
      return {
        formations: await FormationRepository.find(
          {
            cfd: data["Cfd"],
          },
          { returnStream: false }
        ),
        keywords: data.data
          .map((k) => ({
            keyword: diacritics.remove(k.mot_clef).toLowerCase(),
            weight: k.score,
          }))
          .filter(({ keyword }) => !keywordsToRemove.includes(keyword)),
      };
    }),
    writeData(async ({ formations, keywords }) => {
      for (const formation of formations) {
        try {
          for (const keyword of keywords) {
            await FormationKeywordRepository.upsert({
              formationId: formation.id,
              keyword: keyword.keyword,
              weight: keyword.weight,
            });
          }

          logger.info(`Mots clés pour ${formation.mef11 || formation.cfd} ajoutées`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les mots clés pour ${formation.mef11 || formation.cfd}`);
          stats.failed++;
        }
      }
    })
  );

  return stats;
}

async function importKeywordFromFields() {
  logger.info(`Importation des mot clés de formations`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    await FormationRepository.find({}),
    transformData(async (formation) => {
      return await FormationRepository.get(
        {
          cfd: formation.cfd,
          codeDispositif: formation.codeDispositif,
          voie: formation.voie,
        },
        { withMetier: true, withIndicateur: false, withPoursuite: false }
      );
    }),
    writeData(
      async (formation) => {
        try {
          // Ajout du libelle
          await FormationKeywordRepository.upsert({
            formationId: formation.id,
            keyword: formatLibelle(formation.libelle),
            weight: 1,
          });

          // Ajout du sigle
          if (formation.sigle) {
            await FormationKeywordRepository.upsert({ formationId: formation.id, keyword: formation.sigle, weight: 1 });
          }

          // Ajout des domaines
          for (const { domaine, sousDomaine } of formation.domaine || []) {
            await FormationKeywordRepository.upsert({ formationId: formation.id, keyword: domaine, weight: 1 });
            await FormationKeywordRepository.upsert({ formationId: formation.id, keyword: sousDomaine, weight: 1 });
          }

          // Ajout des métiers
          for (const metier of formation.metier || []) {
            await FormationKeywordRepository.upsert({ formationId: formation.id, keyword: metier.libelle, weight: 1 });
          }

          logger.info(`Mots clés pour ${formation.mef11 || formation.cfd} ajoutées`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les mots clés pour ${formation.mef11 || formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

export async function importKeyword() {
  //Clean old
  await FormationKeywordRepository.remove({});

  const statsFile = await importKeywordFile();
  const stats = await importKeywordFromFields();

  return { stats, statsFile };
}
