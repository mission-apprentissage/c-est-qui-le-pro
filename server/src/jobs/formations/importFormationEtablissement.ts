import { oleoduc, writeData, transformData, concatStreams, compose, filterData, mergeStreams } from "oleoduc";
import { omit, pick, uniq } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";
import moment from "#src/common/utils/dateUtils";
import FormationRepository from "#src/common/repositories/formation";
import { streamOnisepFormations } from "./streamOnisepFormations";
import { kdb, upsert } from "#src/common/db/db";
import EtablissementRepository from "#src/common/repositories/etablissement";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";
import FormationEtablissementRepository, {
  FORMATION_ETABLISSEMENT_STATE,
} from "#src/common/repositories/formationEtablissement";
import IndicateurEntreeRepository from "#src/common/repositories/indicateurEntree";
import IndicateurPoursuiteRepository from "#src/common/repositories/indicateurPoursuite";

const logger = getLoggerWithContext("import");

export const formatDuree = (duree) => duree + " an" + (duree !== "1" ? "s" : "");

export const DIPLOMES_TYPES_ONISEP = [
  "baccalauréat professionnel",
  "brevet de technicien",
  "brevet professionnel agricole",
  //"brevet professionnel de la jeunesse, de l'éducation populaire et du sport",
  "CAP agricole",
  "CAP",
  "certificat technique des métiers",
  "classe de 2de professionnelle",
  "diplôme professionnel de l'animation et du sport",
];

export const DIPLOMES_TYPES_CATALOGUE_APPRENTISSAGE = [
  "BAC PROFESSIONNEL",
  "BAC PROFESSIONNEL AGRICOLE",
  //"BREVET DE TECHNICIEN",
  "BREVET PROFESSIONNEL AGRICOLE DE NIVEAU V",
  //"BREVET PROFESSIONNEL DE LA JEUNESSE, DE L'EDUCATION POPULAIRE ET DU SPORT",
  "CERTIFICAT D'APTITUDE PROFESSIONNELLE AGRICOLE",
  "CERTIFICAT D'APTITUDES PROFESSIONNELLES AGRICOLES",
  "CERTIFICAT D'APTITUDE PROFESSIONNELLE",
  "CERTIFICAT D'APTITUDES PROFESSIONNELLES",
  "TH DE NIV 5 MINISTERE DE LA JEUNESSE ET DES SPORTS",
];

async function streamCAFormations({ stats }) {
  const codesDiplomeToFilter = [
    "561", // CS3
  ];
  return compose(
    // On ne renvoi que les formations post 3ème publié
    mergeStreams(await RawDataRepository.search(RawDataType.CatalogueApprentissage, { published: true, annee: "1" })),
    filterData(
      ({ data }) =>
        data.uai_formation &&
        DIPLOMES_TYPES_CATALOGUE_APPRENTISSAGE.includes(data.diplome) &&
        !codesDiplomeToFilter.find((code) => data.cfd.substr(0, 3) === code)
    ),
    // On filtre les Bac Pro qui ne dure que 2 ans dans le Catalogue de l'apprentissage : entrée en deuxième année
    filterData(({ data }) => {
      return (data.diplome != "BAC PROFESSIONNEL" && data.diplome != "BAC PROFESSIONNEL AGRICOLE") || data.duree == "3";
    }),
    transformData(async ({ data }) => {
      stats.total++;

      const dataFormatted = {
        millesime: data.periode.map((p) => moment(p).year().toString()),
        duree: formatDuree(data.duree),
      };

      return {
        query: { uai: data.uai_formation.toUpperCase(), voie: "apprentissage", cfd: data.cfd, codeDispositif: null },
        data: dataFormatted,
      };
    })
  );
}

export async function importFormationEtablissement() {
  logger.info(`Importation des formations depuis l'onisep' et depuis le catalogue de l'apprentissage`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0, deleted: 0 };

  await FormationEtablissementRepository.startUpdate();

  await oleoduc(
    // Important des formations depuis l'Idéo actions de formation initiale de l'Onisep et du catalogue de l'apprentissage
    concatStreams(await streamOnisepFormations({ stats }), await streamCAFormations({ stats })),
    transformData(async ({ query, data }) => {
      const etablissement = await EtablissementRepository.get(pick(query, ["uai"]));
      const formation = await FormationRepository.get(pick(query, ["cfd", "voie", "codeDispositif"]));

      return { data, query, etablissement, formation };
    }),
    filterData(({ etablissement, query }) => {
      if (!etablissement) {
        logger.error(`L'établissement ${query.uai} n'existe pas.`);
        stats.failed++;
      }
      return etablissement;
    }),
    filterData(({ formation, query }) => {
      if (!formation) {
        logger.error(`La formation ${query.voie}/${query.cfd}/${query.codeDispositif} n'existe pas.`);
        stats.failed++;
      }
      return formation;
    }),
    writeData(
      async ({ etablissement, formation, data }) => {
        try {
          const queryData = {
            ...omit(data, "millesime"),
            etablissementId: etablissement.id,
            formationId: formation.id,
            state: FORMATION_ETABLISSEMENT_STATE.updated,
          };

          const result = await upsert(
            kdb,
            "formationEtablissement",
            ["formationId", "etablissementId"],
            queryData,
            queryData,
            ["id", "millesime"]
          );

          await kdb
            .updateTable("etablissement")
            .set({ hasFormation: true })
            .where("id", "=", etablissement.id)
            .executeTakeFirst();

          // Update to have array of unique millesime
          if (result.id) {
            const millesime = uniq([...(result.millesime || []), ...data.millesime]);
            kdb.updateTable("formationEtablissement").set({ millesime }).where("id", "=", result.id).executeTakeFirst();
          }

          logger.info(`Formation ${etablissement.uai}/${formation.cfd}  ajoutée ou mise à jour`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de la formation ${etablissement.uai}/${formation.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  //stats.deleted = await FormationEtablissementRepository.removeStale();

  return stats;
}

export async function cleanFormationEtablissement() {
  logger.info(`Suppression du catalogue de formations précédent`);

  await IndicateurEntreeRepository.remove({});
  await IndicateurPoursuiteRepository.remove({});
  const resultFormationEtablissement = await FormationEtablissementRepository.remove({});

  logger.info(`${resultFormationEtablissement.length} formations supprimées`);
  return { deleted: resultFormationEtablissement.length };
}
