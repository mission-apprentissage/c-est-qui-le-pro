import Typesense from "typesense";
import { oleoduc, writeData, transformData, flattenArray, filterData, accumulateData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import FormationEtablissementRepository from "#src/common/repositories/formationEtablissement";
import { flatten, uniq } from "lodash-es";
import config from "#src/config.js";
import FormationKeywordRepository from "#src/common/repositories/formationKeyword";
import { Readable } from "stream";

const logger = getLoggerWithContext("search");

const typesense = new Typesense.Client({
  apiKey: config.typesense.apiKey,
  nodes: [{ host: config.typesense.host, port: config.typesense.port, protocol: "http" }],
  numRetries: 3,
  connectionTimeoutSeconds: 10,
});

type FormationSearch = {
  id: string;
  keywords: string[];
};

type FormationSearchReverse = {
  id: string;
  keyword: string;
  keyword_weight: number;
  ids: string[];
};

const schema = {
  name: "formation",
  fields: [
    { name: "id", type: "string" as const },
    { name: "keywords", type: "string[]" as const },
  ],
};

const schemaReverse = {
  name: "formationReverse",
  fields: [
    { name: "id", type: "string" as const },
    { name: "keyword", type: "string" as const, locale: "fr", stem: true },
    { name: "keyword_weight", type: "int32" as const },
    { name: "ids", type: "string[]" as const, index: false },
  ],
};

export async function createSearchIndex() {
  logger.info(`Création d'un index de recherche pour les formations dans un établissement`);

  try {
    await typesense.collections(schema.name).delete();
  } catch (_) {
    // do nothing
  }

  await typesense.collections().create(schema);

  await oleoduc(
    await FormationEtablissementRepository.find({}),
    transformData(async (data) => {
      const formation = data.formation;
      const formationsFamilleMetier = formation.familleMetierId
        ? await Promise.all(
            (
              await FormationEtablissementRepository.find(
                {
                  etablissementId: data.formationEtablissement.etablissementId,
                  familleMetierId: formation.familleMetierId,
                },
                false
              )
            )
              .filter((f) => f.formation.id !== formation.id && f.formation.isAnneeCommune !== formation.isAnneeCommune)
              .map(async (f) => ({
                ...f,
                keywords: await FormationKeywordRepository.find({ formationId: f.formation.id }, false),
              }))
          )
        : null;

      return {
        formationEtablissement: data.formationEtablissement,
        formation,
        formationsFamilleMetier,
        keywords: await FormationKeywordRepository.find({ formationId: formation.id }, false),
      };
    }),
    writeData(async ({ formationEtablissement, formationsFamilleMetier, keywords }) => {
      const keywordsToAdd = uniq(
        flatten([
          keywords.map((k) => k.keyword),
          ...(formationsFamilleMetier || []).map((f) => f.keywords.map((k) => k.keyword)),
        ])
      );

      await typesense.collections<FormationSearch>(schema.name).documents().create({
        id: formationEtablissement.id,
        keywords: keywordsToAdd,
      });

      logger.info(`Ajout de ${formationEtablissement.id}`);
    })
  );

  return true;
}

export async function createSearchIndexReverse() {
  logger.info(`Création d'un index de recherche pour les formations dans un établissement`);

  try {
    await typesense.collections(schemaReverse.name).delete();
  } catch (_) {
    // do nothing
  }
  await typesense.collections().create(schemaReverse);

  await oleoduc(
    Readable.from(await FormationKeywordRepository.formationIdsByKeywordAndWeight()),
    transformData(async (data: { keyword: string; weight: number; formationIds: string[] }) => {
      const formationsEtablissementIds = [];

      await oleoduc(
        Readable.from(data.formationIds),
        transformData(async (id) => FormationEtablissementRepository.find({ formationId: id }, false)),
        // Accumulate all formation in the same group
        accumulateData(
          (acc, value) => {
            return [...acc, ...value];
          },
          { accumulator: [] }
        ),
        transformData((formationsDetail) => {
          //Order by status public first
          const statutOrder = {
            public: 1,
            privé: 2,
          };
          const statutDetailOrder = {
            "sous contrat": 1,
            null: 2,
            "reconnu par l'Etat": 3,
            "hors contrat": 4,
          };

          return formationsDetail.sort(({ etablissement: a }, { etablissement: b }) => {
            const statutComparison = statutOrder[a.statut] - statutOrder[b.statut];
            if (statutComparison !== 0) {
              return statutComparison;
            }

            return statutDetailOrder[a.statutDetail] - statutDetailOrder[b.statutDetail];
          });
        }),
        flattenArray(),
        transformData(async (formationDetail) => {
          const { formation, formationEtablissement } = formationDetail;
          const formationFamilleMetierIds = formation.familleMetierId
            ? await Promise.all(
                (
                  await FormationEtablissementRepository.find(
                    {
                      etablissementId: formationEtablissement.etablissementId,
                      familleMetierId: formation.familleMetierId,
                    },
                    false
                  )
                )
                  .filter(
                    (f) => f.formation.id !== formation.id && f.formation.isAnneeCommune !== formation.isAnneeCommune
                  )
                  .map(async (f) => f.formationEtablissement.id)
              )
            : null;

          return { id: formationEtablissement.id, formationFamilleMetierIds };
        }),
        writeData(async ({ id, formationFamilleMetierIds }) => {
          formationsEtablissementIds.push(id);
          if (formationFamilleMetierIds) {
            formationFamilleMetierIds.forEach((id) => {
              formationsEtablissementIds.push(id);
            });
          }
        })
      );

      return {
        keyword: data.keyword,
        keyword_weight: data.weight,
        formationsEtablissementIds: uniq(formationsEtablissementIds),
      };
    }),
    filterData((data) => data.formationsEtablissementIds && data.formationsEtablissementIds.length > 0),
    writeData(async ({ keyword, keyword_weight, formationsEtablissementIds }) => {
      await typesense
        .collections<FormationSearchReverse>(schemaReverse.name)
        .documents()
        .create({
          id: `${keyword}_${keyword_weight}`,
          keyword: keyword,
          keyword_weight: Math.round(keyword_weight * 1000), // Convert weight to integer to fix filter issue
          ids: formationsEtablissementIds,
        });

      logger.info(`Ajout de ${keyword} pour ${formationsEtablissementIds.length}`);
    })
  );

  return true;
}

export async function search(input: string): Promise<null | string[]> {
  const searchParameters = {
    q: input,
    query_by: "keywords",
    per_page: 250,
    page: 1,
  };

  const ids = [];

  let currentPage = 1;
  let totalPages = 1;

  do {
    searchParameters.page = currentPage;
    const searchResults = await typesense
      .collections<FormationSearch>(schema.name)
      .documents()
      .search(searchParameters);

    if (currentPage === 1) {
      totalPages = Math.ceil(searchResults.found / searchParameters.per_page);
    }

    ids.push(...searchResults.hits.map((r) => r.document.id));
    currentPage++;
  } while (currentPage <= totalPages);

  return ids;
}

export async function searchReverse(input: string, minWeight: number = 0): Promise<null | string[]> {
  const searchParameters = {
    q: input,
    query_by: "keyword",
    per_page: 250,
    page: 1,
    sort_by: "_text_match(bucket_size: 4):desc,keyword_weight:desc,_text_match:desc",
    //sort_by: "_text_match(bucket_size: 6):desc,keyword_weight:desc",
    //exhaustive_search: true,
    //typo_tokens_threshold: 2,
    prioritize_exact_match: true,
    //prefix: false,
    filter_by: `keyword_weight:>=${minWeight}`,
  };

  const ids = [];

  let currentPage = 1;
  let totalPages = 1;

  do {
    searchParameters.page = currentPage;
    const searchResults = await typesense
      .collections<FormationSearchReverse>(schemaReverse.name)
      .documents()
      .search(searchParameters);

    if (currentPage === 1) {
      totalPages = Math.ceil(searchResults.found / searchParameters.per_page);
    }

    ids.push(...flatten(searchResults.hits.map((r) => r.document.ids)));
    currentPage++;
  } while (currentPage <= totalPages);

  return uniq(ids);
}
