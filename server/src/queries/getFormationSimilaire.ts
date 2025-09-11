import { kdb, kyselyChainFn } from "#src/common/db/db.js";
import { sql } from "kysely";
import EtablissementRepository from "#src/common/repositories/etablissement";
import { Etablissement, Formation, FormationEtablissement } from "#src/common/db/schema.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import FormationRepository from "#src/common/repositories/formation";

type FilterEtablissement = {
  timeLimit?: number;
  academie?: number;
  latitude: string;
  longitude: string;
};

type FormationSimilaireFilters = {
  formationId: string;
  filtersEtablissement: FilterEtablissement;
  millesime: string[];
};

type FormationSimilairePagination = {
  limit?: number;
};

async function buildIsochronesQuery({ timeLimit, latitude, longitude }: FilterEtablissement) {
  return {
    query: kdb
      .selectFrom(
        kdb
          .selectFrom("etablissementIsochrone")
          .where(({ eb }) =>
            eb(
              kyselyChainFn(eb, [
                {
                  fn: "ST_Within",
                  args: [
                    kyselyChainFn(eb, [
                      { fn: "ST_Point", args: [sql`${longitude}`, sql`${latitude}`] },
                      { fn: "ST_SetSRID", args: [sql`4326`] },
                    ]),
                    "geom",
                  ],
                },
              ]),
              "=",
              true
            )
          )
          .selectAll()
          .select("bucket as time")
          .distinctOn("etablissementId")
          .orderBy("etablissementId")
          .orderBy("bucket")
          .as("etablissementIsochrone")
      )
      .select("etablissementId as bucketId")
      .select("time")
      .select("modalite")
      .where("time", "<=", timeLimit)
      .orderBy("time")
      .as("buckets"),
  };
}

async function buildFiltersEtablissement({ timeLimit, academie, latitude, longitude }: FilterEtablissement) {
  const distanceQuery = (eb) => {
    return kyselyChainFn(eb, [
      { fn: "ST_Point", args: [sql`${longitude}`, sql`${latitude}`] },
      { fn: "ST_SetSRID", args: [sql`4326`] },
      { fn: "ST_DistanceSphere", args: ["coordinate"] },
    ]);
  };

  const queryEtablissement = kdb
    .selectFrom((eb) =>
      eb
        .selectFrom("etablissement")
        .$call(EtablissementRepository._base())
        .selectAll()
        .select((eb) => distanceQuery(eb).as("distance"))
        .where("hasFormation", "=", true)
        .as("etablissement")
    )
    .selectAll()
    .select("distance");

  const queryIsochrones = await buildIsochronesQuery({ timeLimit, latitude, longitude });

  return {
    query: queryEtablissement
      .leftJoin(queryIsochrones.query, (join) => join.onRef("etablissement.id", "=", "buckets.bucketId"))
      .select("buckets.time as accessTime")
      .orderBy("buckets.time")
      .select(
        sql<string>`ROW_NUMBER() OVER (ORDER BY  ${sql.raw(
          [queryIsochrones ? "buckets.time" : null, "etablissement.distance", "etablissement.id"]
            .filter((d) => d)
            .join(",")
        )})`.as("order")
      )
      .where((eb) => eb.or([eb("academie", "=", academie), eb("buckets.time", "is not", null)])),
  };
}

async function buildFiltersFormation() {
  const queryFormation = kdb.selectFrom("formation").$call(FormationRepository._base()).selectAll();

  return { query: queryFormation };
}

export async function getFormationsSimilaire(
  { formationId, filtersEtablissement, millesime }: FormationSimilaireFilters,
  pagination: FormationSimilairePagination = { limit: 12 }
) {
  const limit = pagination.limit || 12;
  const queryEtablissement = await buildFiltersEtablissement(filtersEtablissement as any);
  const queryFormation = await buildFiltersFormation();

  const results = await kdb
    .selectFrom(
      kdb
        .selectFrom(
          kdb
            .selectFrom(
              kdb
                .selectFrom("formationSimilaire")
                .where("formationId", "=", formationId)
                .select("similarityOrder")
                .innerJoin(
                  (eb) =>
                    eb
                      .selectFrom("formationEtablissement")
                      .select((eb) => eb.fn("row_to_json", [sql`formation`]).as("formation"))
                      .select((eb) =>
                        eb.fn("row_to_json", [sql`"formationEtablissement"`]).as("formationEtablissement")
                      )
                      .select((eb) => eb.fn("row_to_json", [sql`etablissement`]).as("etablissement"))
                      .select("formationEtablissement.id as id")
                      .where("millesime", "&&", [millesime])
                      .innerJoin(
                        queryEtablissement.query.as("etablissement"),
                        "formationEtablissement.etablissementId",
                        "etablissement.id"
                      )
                      .select("etablissement.order as order")
                      .select("etablissement.statut as etablissementStatut")
                      .innerJoin(
                        queryFormation.query.as("formation"),
                        "formationEtablissement.formationId",
                        "formation.id"
                      )
                      .select("formationEtablissement.formationId as formationIdBase")
                      .select("cfd")
                      .where("formation.id", "!=", formationId)
                      .as("results"),
                  (join) => join.onRef("formationSimilaire.formationRelatedId", "=", "results.formationIdBase")
                )
                .selectAll("results")
                .orderBy("similarityOrder")
                .as("results")
            )
            .leftJoin("indicateurPoursuite", "formationEtablissementId", "results.id")
            .distinctOn("results.cfd")
            .select(sql`COUNT(*) OVER ()`.as("total"))
            .select("results.formationEtablissement")
            .select("results.formation")
            .select("results.etablissement")
            .select("similarityOrder")
            .select("order")
            .select("results.id")
            .orderBy("results.cfd")
            .orderBy("results.etablissementStatut", "desc")
            .orderBy((eb) => eb.fn.coalesce("indicateurPoursuite.taux_autres_6_mois", sql.val(100)))
            .as("formations")
        )
        .limit(limit)
        .selectAll()
        .orderBy("similarityOrder")
        .orderBy("order")
        .as("formations")
    )
    .select((eb) =>
      jsonBuildObject({
        formations: eb.fn.coalesce(
          sql<
            { formation: Formation; etablissement: Etablissement; formationEtablissement: FormationEtablissement }[]
          >`json_agg(to_jsonb(formations.*) - 'total' - 'id' - 'order' ORDER BY formations."similarityOrder", formations.order, formations.id)`,
          sql.val("[]")
        ),
      }).as("results")
    )
    .executeTakeFirst();

  return results;
}
