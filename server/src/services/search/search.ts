import { oleoduc, writeData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationRepository from "#src/common/repositories/formation";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import Fuse, { IFuseOptions } from "fuse.js";
import { uniq } from "lodash-es";
import fs from "fs";
import config from "#src/config.js";
const logger = getLoggerWithContext("search");

let fuse: Fuse<any> = null;

type FormationSearch = {
  id: string;
  libelles: string[];
};

export async function createSearchIndex(indexDir = config.formation.files.fuseIndex) {
  logger.info(`Création d'un index de recherche pour les formations dans un établissement`);
  const formations = [];
  await oleoduc(
    await FormationEtablissementRepository.find({}),
    transformData(async (data) => {
      const formation = await FormationRepository.first({ id: data.formationId });
      const formationsFamilleMetier = formation.familleMetierId
        ? await FormationRepository.familleMetier(formation.familleMetierId)
        : [];
      return { formationEtablissement: data, formation, formationsFamilleMetier };
    }),
    writeData(async ({ formationEtablissement, formation, formationsFamilleMetier }) => {
      const filteredFamilleMetier = (
        await Promise.all(
          formationsFamilleMetier.map(async (familleMetier) => {
            const exist = await FormationEtablissementRepository.first({
              etablissementId: formationEtablissement.etablissementId,
              formationId: familleMetier.id,
            });
            return { ...familleMetier, exist };
          })
        )
      ).filter((f) => f.exist);

      logger.info(`Ajout de ${formationEtablissement.id}`);
      formations.push({
        id: formationEtablissement.id,
        libelle: formation.libelle,
        libelles: uniq([formation.libelle, ...filteredFamilleMetier.map((f) => f.libelle)]),
      });
    })
  );

  logger.info(`Indexation de ${formations.length} formations`);

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
    indexDir,
    JSON.stringify({
      formations: formations,
      index: myIndex,
      options: fuseOptions,
    })
  );

  return true;
}

export async function loadSearchIndex(): Promise<{
  formations: FormationSearch[];
  index: any;
  options: IFuseOptions<any>;
}> {
  try {
    const fuseIndex = JSON.parse((await fs.promises.readFile(config.formation.files.fuseIndex, "utf8")) || null);
    return fuseIndex;
  } catch (err) {
    logger.error(err);
    return null;
  }
}

export async function getSearch(): Promise<Fuse<any>> {
  if (!fuse) {
    const fuseIndex = await loadSearchIndex();
    if (!fuseIndex) {
      return null;
    }

    const { formations, index, options } = fuseIndex;
    fuse = new Fuse(formations, options, Fuse.parseIndex(index));
  }
  return fuse;
}
