import { GraphHopperApi } from "#src/services/graphHopper/graphHopper.js";
import * as Cache from "#src/common/cache.js";
import moment from "#src/common/utils/dateUtils";
import { DiplomeType, FormationTag } from "shared";
import { getLoggerWithContext } from "#src/common/logger.js";
import { kdb, kyselyChainFn } from "#src/common/db/db.js";
import { SelectQueryBuilder, sql } from "kysely";
import EtablissementRepository from "#src/common/repositories/etablissement";
import { DB, Etablissement, Formation, FormationEtablissement } from "#src/common/db/schema.js";
import { jsonBuildObject } from "kysely/helpers/postgres";
import FormationRepository from "#src/common/repositories/formation";
import config from "#src/config";
import { search } from "#src/services/formation/search.js";
import { flatten, pick } from "lodash-es";

const logger = getLoggerWithContext("query");

export function buildFilterTag(eb, tag) {
  if (!tag || tag.length === 0) {
    return eb;
  }

  const formationTag = Object.values(FormationTag);
  for (const t of tag) {
    if (!formationTag.includes(t)) {
      logger.error(`Tag ${t} inconnu dans les filtres de formations`);
      return eb;
    }
  }

  return eb.where(sql.val(tag), "<@", sql.ref("tags"));
}

export function getRouteDate() {
  if (config.features.graphhopper.useStaticDate) {
    return moment("2024-09-09").set({ hour: 8, minute: 30, second: 0, millisecond: 0 }).toDate();
  }
  return moment().startOf("isoWeek").add(1, "week").set({ hour: 8, minute: 30, second: 0, millisecond: 0 }).toDate();
}

async function buildIsochronesQuerySQL({ timeLimit, latitude, longitude }, precomputed = false) {
  const buckets = [7200, 5400, 3600, 2700, 1800, 900];
  const bufferPrecision = 0.001; // ~100m
  const simplifyPrecision = 0.0001; // ~10m
  let isochroneBuckets = null;

  if (precomputed) {
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
        .orderBy("time")
        .as("buckets"),
    };
  }

  const buildSubQueryIsochrone = (query: SelectQueryBuilder<DB, "etablissement", object>, bucket) => {
    return query
      .select(sql<number>`${bucket.time}::integer`.as("time"))
      .select("id as bucketId")
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

  const graphHopperApi = new GraphHopperApi();
  try {
    const graphHopperParameter = {
      point: `${latitude},${longitude}`,
      departureTime: getRouteDate(),
      buckets: buckets.filter((b) => b <= timeLimit),
      reverse_flow: false,
    };

    isochroneBuckets = await Cache.getOrSet(JSON.stringify(graphHopperParameter), () =>
      graphHopperApi.fetchIsochronePTBucketsRaw(graphHopperParameter)
    );
  } catch (_err) {
    return null;
  }

  if (!isochroneBuckets || isochroneBuckets.length === 0) {
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
        kdb
          .selectFrom(queryIsochrone.as("buckets"))
          .selectAll()
          .distinctOn("uai")
          .orderBy("uai")
          .orderBy("time")
          .as("buckets")
      )
      .select("time")
      .select("bucketId")
      .orderBy("time")
      .as("buckets"),
  };
}

async function buildFiltersEtablissementSQL({ timeLimit, distance, latitude, longitude, uais, academie }) {
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
        .selectAll("etablissement")
        .selectAll("JPODates")
        .select((eb) => distanceQuery(eb).as("distance"))
        .where("hasFormation", "=", true)
        .as("etablissement")
    )
    .selectAll("etablissement");

  if (uais.length > 0) {
    queryEtablissement = queryEtablissement.where("uai", "in", uais);
  }

  if (latitude === null || longitude === null) {
    return {
      query: queryEtablissement.select(sql.val(null).as("accessTime")),
      order: sql.raw(['"etablissementId"', "id"].filter((d) => d).join(",")),
    };
  }

  const queryIsochrones = timeLimit ? await buildIsochronesQuerySQL({ timeLimit, latitude, longitude }, true) : null;

  return {
    query: queryEtablissement
      .$if(!!queryIsochrones, (qb) =>
        qb
          .leftJoin(queryIsochrones.query, (join) => join.onRef("etablissement.id", "=", "buckets.bucketId"))
          .select("buckets.time as accessTime")
          .orderBy("buckets.time")
      )
      .$if(!queryIsochrones, (qb) => qb.select(sql.val(null).as("accessTime")).select(sql.val(null)))
      .where((eb) =>
        eb.or([eb("academie", "=", academie), ...(queryIsochrones ? [eb("buckets.time", "is not", null)] : [])])
      )
      .$if(distance || (timeLimit && !queryIsochrones), (qb) => qb.where("etablissement.distance", "<", distance)),
    order: sql.raw(
      [
        queryIsochrones ? '"accessTime"' : null,
        queryIsochrones ? 'case when "accessTime" is not null then statut else null end DESC' : null,
        queryIsochrones
          ? `case when "accessTime" is not null then array_position(array['sous contrat',null,'reconnu par l''Etat', 'hors contrat'], "statutDetail") else null end`
          : null,
        "distance",
        '"etablissementId"',
        "id",
      ]
        .filter((d) => d)
        .join(",")
    ),
  };
}

async function buildFiltersFormationSQL({ cfds, domaines, voie, diplome }) {
  let queryFormation = kdb
    .selectFrom("formation")
    .$call(FormationRepository._base())
    .selectAll()
    .where((eb) => eb.or([eb("familleMetierId", "is", null), eb("isAnneeCommune", "=", true)]));

  if (cfds.length > 0) {
    queryFormation = queryFormation.where("cfd", "in", cfds);
  }

  if (voie.length > 0) {
    queryFormation = queryFormation.where("voie", "in", voie);
  }

  if (diplome.length > 0) {
    queryFormation = queryFormation.where("niveauDiplome", "in", flatten(Object.values(pick(DiplomeType, diplome))));
  }

  if (!domaines || domaines.length === 0) {
    return { query: kdb.selectFrom(queryFormation.as("formation")).selectAll() };
  }

  return {
    query: kdb
      .selectFrom(
        kdb
          .selectFrom("formationDomaine")
          .select("formationId")
          .innerJoin("domaine", "domaine.id", "formationDomaine.domaineId")
          .where("domaine.domaine", "in", domaines)
          .groupBy("formationId")
          .as("domaineFilter")
      )
      .innerJoin(queryFormation.as("formation"), "formation.id", "domaineFilter.formationId")
      .selectAll(),
  };
}

async function getFiltersId(formation) {
  if (!formation) {
    return null;
  }

  // Fuse search
  return await search(formation);
}

export async function getFormationsSQL(
  {
    filtersEtablissement = {},
    filtersFormation = { cfds: null, domaines: null, voie: null, diplome: null },
    tag = null,
    millesime,
    formation = null,
  },
  pagination = { page: 1, limit: 100 }
) {
  const page = pagination.page || 1;
  const limit = pagination.limit || 100;
  const skip = (page - 1) * limit;

  // GET ISOCHRONES BUCKETS
  const queryEtablissement = await buildFiltersEtablissementSQL(filtersEtablissement as any);

  const queryFormation = await buildFiltersFormationSQL(filtersFormation as any);

  const filtersId = await getFiltersId(formation);

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
            .$if(!!tag, (eb) => buildFilterTag(eb, tag))
            .$if(!!filtersId, (eb) =>
              eb.where((eb) => eb("formationEtablissement.id", "=", eb.fn.any(sql.val(filtersId))))
            )
            .where("formationEtablissement.millesime", "&&", [millesime])
            .innerJoin(
              queryEtablissement.query.as("etablissement"),
              "formationEtablissement.etablissementId",
              "etablissement.id"
            )
            .select("etablissement.accessTime as accessTime")
            .select("etablissement.statut as statut")
            .select("etablissement.statutDetail as statutDetail")
            .select("etablissement.distance as distance")
            .select("etablissement.id as etablissementId")
            .innerJoin(queryFormation.query.as("formation"), "formationEtablissement.formationId", "formation.id")
            .select("formation.familleMetierId as familleMetierId")
            .as("results")
        )
        // Formation de spécialisation de la famille de métiers
        .leftJoinLateral(
          (eb) =>
            eb
              .selectFrom("formationFamilleMetierMView")
              .select("formationsFamilleMetier")
              .whereRef("etablissementId", "=", "results.etablissementId")
              .whereRef("familleMetierId", "=", "results.familleMetierId")
              .where("millesime", "&&", [millesime])
              .limit(1)
              .as("formationsFamilleMetier"),
          (join) => join.on(sql`true`)
        )
        .select(sql`COUNT("accessTime") OVER ()`.as("totalIsochrone"))
        .select(sql`COUNT(*) OVER ()`.as("total"))
        .select(sql<string>`ROW_NUMBER() OVER (ORDER BY  ${queryEtablissement.order})`.as("order"))
        .selectAll()
        .limit(limit)
        .offset(skip)
        .orderBy(queryEtablissement.order)
        //.orderBy("order")
        .as("formations")
    )
    .select((eb) =>
      jsonBuildObject({
        pagination: jsonBuildObject({
          total: eb.fn.coalesce(eb.fn.max("total"), sql.val<number>(0)),
          totalIsochrone: eb.fn.coalesce(eb.fn.max("totalIsochrone"), sql.val<number>(0)),
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
          >`json_agg(to_jsonb(formations.*) - 'total' - 'id' - 'order' - 'statut' - 'statutDetail' - 'distance' - 'etablissementId' - 'totalIsochrone' ORDER BY formations.order, formations.id)`,
          sql.val("[]")
        ),
      }).as("results")
    )
    .executeTakeFirst();

  return results;
}
