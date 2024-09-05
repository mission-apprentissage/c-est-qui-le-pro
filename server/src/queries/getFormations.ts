import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";
import * as Cache from "#src/common/cache.js";
import moment from "#src/common/utils/dateUtils.js";
import { FORMATION_TAG } from "#src/common/constants/formationEtablissement.js";
import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb, kyselyChainFn } from "#src/common/db/db.js";
import { sql } from "kysely";
import EtablissementRepository from "#src/common/repositories/etablissement";
import { Etablissement, Formation, FormationEtablissement } from "#src/common/db/schema.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import FormationRepository from "#src/common/repositories/formation";

const logger = getLoggerWithContext("query");

export function buildFilterTag(eb, tag) {
  if (!tag) {
    return eb;
  }

  const formationTag = Object.values(FORMATION_TAG).includes(tag);
  if (!formationTag) {
    logger.error(`Tag ${tag} inconnu dans les filtres de formations`);
    return eb;
  }

  return eb.where((eb) => eb(sql.val(tag), "=", eb.fn.any("tags")));
}

export function getRouteDate() {
  return moment().startOf("isoWeek").add(1, "week").set({ hour: 8, minute: 30, second: 0, millisecond: 0 }).toDate();
}

async function buildIsochronesQuerySQL({ timeLimit, latitude, longitude }) {
  const bufferPrecision = 0.001; // ~100m
  const simplifyPrecision = 0.0001; // ~10m
  let isochroneBuckets = null;

  const buildSubQueryIsochrone = (query, bucket) => {
    return query
      .select(sql<number>`${bucket.time}::integer`.as("time"))
      .select("uai")
      .where("hasFormation", "=", true)
      .where(({ eb }) =>
        eb(
          kyselyChainFn(
            eb,
            [
              { fn: "ST_GeomFromGeoJson", args: [] },
              { fn: "ST_Simplify", args: [eb.val(simplifyPrecision), eb.val(true)] },
              { fn: "ST_Buffer", args: [eb.val(bufferPrecision)] },
              { fn: "ST_Contains", args: ["coordinate"] },
            ],
            sql`${JSON.stringify(bucket.geometry)}`
          ),
          "=",
          true
        )
      );
  };

  const buckets = [7200, 5400, 3600, 2700, 1800, 900];
  const graphHopperApi = new GraphHopperApi();
  try {
    const graphHopperParameter = {
      point: `${latitude},${longitude}`,
      departureTime: getRouteDate(),
      buckets: buckets.filter((b) => b <= timeLimit),
      reverse_flow: true,
    };

    isochroneBuckets = await Cache.getOrSet(JSON.stringify(graphHopperParameter), () =>
      graphHopperApi.fetchIsochronePTBucketsRaw(graphHopperParameter)
    );
  } catch (err) {
    return null;
  }

  if (isochroneBuckets.length === 0) {
    return null;
  }

  let queryIsochrone = buildSubQueryIsochrone(kdb.selectFrom("etablissement"), isochroneBuckets[0]);
  for (const bucket of isochroneBuckets.slice(1)) {
    queryIsochrone = queryIsochrone.union((eb) =>
      eb.parens(buildSubQueryIsochrone(eb.selectFrom("etablissement"), bucket))
    );
  }

  return {
    query: kdb
      .selectFrom(
        kdb.selectFrom(queryIsochrone).selectAll().distinctOn("uai").orderBy("uai").orderBy("time").as("buckets")
      )
      .selectAll()
      .orderBy("time")
      .as("buckets"),
  };
}

async function buildFiltersEtablissementSQL({ timeLimit, distance, latitude, longitude, uais }) {
  const distanceQuery = (eb) => {
    return kyselyChainFn(eb, [
      { fn: "ST_Point", args: [sql`${longitude}`, sql`${latitude}`] },
      { fn: "ST_SetSRID", args: [sql`4326`] },
      { fn: "ST_DistanceSphere", args: ["coordinate"] },
    ]);
  };

  let queryEtablissement = kdb
    .selectFrom((eb) =>
      eb
        .selectFrom("etablissement")
        .$call(EtablissementRepository._base())
        .select((eb) => distanceQuery(eb).as("distance"))
        .where("hasFormation", "=", true)
        .as("etablissement")
    )
    .selectAll()
    .select("distance");

  if (uais.length > 0) {
    queryEtablissement = queryEtablissement.where("uai", "in", uais);
  }

  if (latitude === null || longitude === null) {
    return {
      query: queryEtablissement.select(sql<string>`ROW_NUMBER() OVER (ORDER BY etablissement.id)`.as("order")),
    };
  }

  const queryIsochrones = timeLimit ? await buildIsochronesQuerySQL({ timeLimit, latitude, longitude }) : null;

  return {
    query: queryEtablissement
      .$if(!!queryIsochrones, (qb) =>
        qb
          .innerJoin(queryIsochrones.query, (join) => join.onRef("etablissement.uai", "=", "buckets.uai"))
          .select("buckets.time as accessTime")
          .orderBy("buckets.time")
      )
      .$if(distance || (timeLimit && !queryIsochrones), (qb) => qb.where("etablissement.distance", "<", distance))
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

async function buildFiltersFormationSQL({ cfds, domaine }) {
  let queryFormation = kdb.selectFrom("formation").$call(FormationRepository._base());

  if (cfds.length > 0) {
    queryFormation = queryFormation.where("cfd", "in", cfds);
  }

  if (!domaine) {
    return { query: queryFormation };
  }

  return {
    query: kdb
      .selectFrom(
        kdb
          .selectFrom("formationDomaine")
          .select("formationId")
          .innerJoin("domaine", "domaine.id", "formationDomaine.domaineId")
          .where("domaine.domaine", "in", [domaine])
          .groupBy("formationId")
          .as("domaineFilter")
      )
      .innerJoin(queryFormation.as("formation"), "formation.id", "domaineFilter.formationId"),
  };
}

export async function getFormationsSQL(
  { filtersEtablissement = {}, filtersFormation = {}, tag = null, millesime },
  pagination = { page: 1, limit: 100 }
) {
  let page = pagination.page || 1;
  let limit = pagination.limit || 100;
  let skip = (page - 1) * limit;

  // GET ISOCHRONES BUCKETS
  const queryEtablissement = await buildFiltersEtablissementSQL(filtersEtablissement as any);

  const queryFormation = await buildFiltersFormationSQL(filtersFormation as any);

  const results = await kdb
    .selectFrom(
      kdb
        .selectFrom(
          kdb
            .selectFrom("formationEtablissement")
            .select((eb) => eb.fn("row_to_json", [sql`formation`]).as("formation"))
            .select((eb) => eb.fn("row_to_json", [sql`"formationEtablissement"`]).as("formationEtablissement"))
            .select((eb) => eb.fn("row_to_json", [sql`etablissement`]).as("etablissement"))
            .select("formationEtablissement.id as id")
            .$if(tag, (eb) => buildFilterTag(eb, tag))
            .where("millesime", "&&", [millesime])
            .innerJoin(
              queryEtablissement.query.as("etablissement"),
              "formationEtablissement.etablissementId",
              "etablissement.id"
            )
            .select("etablissement.order as order")
            .innerJoin(queryFormation.query.as("formation"), "formationEtablissement.formationId", "formation.id")
            .as("results")
        )
        .select(sql`COUNT(*) OVER ()`.as("total"))
        .selectAll()
        .limit(limit)
        .offset(skip)
        .as("formations")
    )
    .select((eb) =>
      jsonBuildObject({
        pagination: jsonBuildObject({
          total: eb.fn.coalesce(eb.fn.max("total"), sql.val<number>(0)),
          page: sql`${page}::integer`,
          items_par_page: sql`${limit}::integer`,
          nombre_de_page: eb.fn("ceil", [
            eb(eb.fn.coalesce(eb.fn.max("total"), sql.val<number>(0)), "/", sql`${limit}::decimal`),
          ]),
        }),
        // TODO: add additional field to type
        formations: eb.fn.coalesce(
          sql<
            { formation: Formation; etablissement: Etablissement; formationEtablissement: FormationEtablissement }[]
          >`json_agg(to_jsonb(formations.*) - 'total' - 'id' - 'order' ORDER BY formations.order, formations.id)`,
          sql.val("[]")
        ),
      }).as("results")
    )
    .executeTakeFirst();

  return results;
}
