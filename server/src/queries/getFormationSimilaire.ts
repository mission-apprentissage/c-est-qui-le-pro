import { kdb, kyselyChainFn } from "#src/common/db/db.js";
import { sql } from "kysely";
import EtablissementRepository from "#src/common/repositories/etablissement";
import { Etablissement, Formation, FormationEtablissement } from "#src/common/db/schema.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import FormationRepository from "#src/common/repositories/formation";

async function buildIsochronesQuery({ timeLimit, latitude, longitude }) {
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
      .where("time", "<=", timeLimit)
      .orderBy("time")
      .as("buckets"),
  };
}

async function buildFiltersEtablissement({
  timeLimit,
  latitude,
  longitude,
}: {
  timeLimit: number;
  latitude: string;
  longitude: string;
}) {
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
      .innerJoin(queryIsochrones.query, (join) => join.onRef("etablissement.id", "=", "buckets.bucketId"))
      .select("buckets.time as accessTime")
      .orderBy("buckets.time")
      .select(
        sql<string>`ROW_NUMBER() OVER (ORDER BY  ${sql.raw(
          [queryIsochrones ? "buckets.time" : null, "etablissement.distance", "etablissement.id"]
            .filter((d) => d)
            .join(",")
        )})`.as("order")
      )
      .orderBy("etablissement.distance"),
  };
}

async function buildFiltersFormation() {
  const queryFormation = kdb.selectFrom("formation").$call(FormationRepository._base()).selectAll();

  return { query: queryFormation };
}

export async function getFormationsSimilaire(
  { formationId, filtersEtablissement = {}, millesime },
  pagination = { limit: 12 }
) {
  const limit = pagination.limit || 12;
  const queryEtablissement = await buildFiltersEtablissement(filtersEtablissement as any);
  const queryFormation = await buildFiltersFormation();

  const results = await kdb
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
                  .select((eb) => eb.fn("row_to_json", [sql`"formationEtablissement"`]).as("formationEtablissement"))
                  .select((eb) => eb.fn("row_to_json", [sql`etablissement`]).as("etablissement"))
                  .select("formationEtablissement.id as id")
                  .where("millesime", "&&", [millesime])
                  .innerJoin(
                    queryEtablissement.query.as("etablissement"),
                    "formationEtablissement.etablissementId",
                    "etablissement.id"
                  )
                  .select("etablissement.order as order")
                  .innerJoin(queryFormation.query.as("formation"), "formationEtablissement.formationId", "formation.id")
                  .select("formationEtablissement.formationId as formationIdBase")
                  .as("results"),
              (join) => join.onRef("formationSimilaire.formationRelatedId", "=", "results.formationIdBase")
            )
            .selectAll("results")
            .orderBy("similarityOrder")
            .as("results")
        )
        .select(sql`COUNT(*) OVER ()`.as("total"))
        .select("results.formationEtablissement")
        .select("results.formation")
        .select("results.etablissement")
        .select("similarityOrder")
        .select("order")
        .select("id")
        .limit(limit)
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