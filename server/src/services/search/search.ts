import { oleoduc, writeData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationRepository from "#src/common/repositories/formation";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import Fuse from "fuse.js";
import { uniq } from "lodash-es";
import fs from "fs";
const logger = getLoggerWithContext("search");

let fuse: Fuse<any> = null;
let fuse2: Fuse<any> = null;

export async function createSearchIndex() {
  logger.info(`Création d'un index de recherche pour les formations`);
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
  return {
    formations: formations,
    index: myIndex,
    options: fuseOptions,
  };
}

export async function createSearchIndex2() {
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

  return {
    formations: formations,
    index: myIndex,
    options: fuseOptions,
  };
}

export async function getSearch(): Promise<Fuse<any>> {
  if (!fuse) {
    const { formations, index, options } = await createSearchIndex();
    fuse = new Fuse(
      formations,
      {
        ...options,
      },
      Fuse.parseIndex(index)
    );
  }
  return fuse;
}

export async function getSearch2(): Promise<Fuse<any>> {
  if (!fuse2) {
    const { formations, index, options } = await createSearchIndex2();
    fuse2 = new Fuse(
      formations,
      {
        ...options,
      },
      Fuse.parseIndex(index)
    );
  }
  return fuse2;
}
