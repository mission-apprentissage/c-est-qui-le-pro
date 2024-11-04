import { oleoduc, writeData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import config from "#src/config.js";
import FormationRepository from "#src/common/repositories/formation.js";
import Fuse from "fuse.js";
import fs from "fs";
import { uniq } from "lodash-es";

const logger = getLoggerWithContext("import");

export async function createSearchIndex(options = { indexFilePath: null }) {
  logger.info(`Création d'un index de recherche pour les formations`);

  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const indexFilePath = options.indexFilePath || config.formation.files.fuseIndex;

  const formations = [];
  await oleoduc(
    await FormationRepository.find({}),
    transformData(async (data) => {
      const formationsFamilleMetier = data.familleMetierId
        ? await FormationRepository.familleMetier(data.familleMetierId)
        : [];
      return { formation: data, formationsFamilleMetier };
    }),
    writeData(async ({ formation, formationsFamilleMetier }) => {
      formations.push({
        id: formation.id,
        libelle: formation.libelle,
        libelles: uniq([formation.libelle, ...formationsFamilleMetier.map((f) => f.libelle)]),
      });
    })
  );

  logger.info(`Indexation de ${formations.length} formations`);
  stats.total += formations.length;

  const fuseOptions = {
    ignoreLocation: true,
    findAllMatches: true,
    distance: 200,
    threshold: 0.29,
    useExtendedSearch: true,
    includeScore: true,
    keys: ["libelles"],
  };
  const myIndex = Fuse.createIndex(fuseOptions.keys, formations);
  await fs.promises.writeFile(
    indexFilePath,
    JSON.stringify({
      formations: formations,
      index: myIndex,
      options: fuseOptions,
    })
  );

  return stats;
}
