import fs from "fs";
import { filterData, oleoduc, writeData, transformData } from "oleoduc";
import { Readable } from "stream";
import { get } from "lodash-es";

import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import path from "path";

import { getLoggerWithContext } from "#src/common/logger.js";
import { formatLog, kyselyChainFn } from "#src/common/db/db";

const logger = getLoggerWithContext("isochrones");

async function createOutputFolder(output, buckets) {
  for (const bucket of buckets) {
    const dir = path.join(output, bucket.toString());
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function getGeometryForDate(input, date, bucket, file, key) {
  const data = JSON.parse(await fs.promises.readFile(path.join(input, date, bucket.toString(), file), "utf8"));
  const geometry = get(data, key);
  if (geometry === undefined) {
    throw new Error(`Le fichier ${bucket}/${file} est invalide.`);
  }
  return geometry;
}

async function getGeometry(db, input, dates, bucket, file, key) {
  const data = await Promise.all(dates.map(async (date) => await getGeometryForDate(input, date, bucket, file, key)));

  if (dates.length === 1) {
    return { geometry: data[0], bucket };
  }

  // Merge all geometry for a bucket and multiple dates in one geometry
  const result = await db
    .selectFrom(() =>
      db
        .selectNoFrom((eb) => {
          return data.map((geometry, i) => {
            return kyselyChainFn(
              eb,
              [
                { fn: "ST_GeomFromGeoJSON", args: [] },
                { fn: "ST_MakeValid", args: [eb.val("method=structure")] },
              ],
              sql`${geometry}`
            ).as(`geometry_${i}`);
          });
        })
        .as("geometry")
    )
    .select(({ eb }) => {
      return kyselyChainFn(
        eb,
        [
          { fn: "ST_Union", args: [] },
          { fn: "ST_AsGeoJSON", args: [] },
        ],
        sql`ARRAY[${sql.join(
          data.map((_, i) => eb.ref(`geometry_${i}`)),
          sql`, `
        )}]`
      ).as("geometry");
    })
    .executeTakeFirst();

  return { geometry: result.geometry, bucket };
}

export async function splitIsochrones({
  input,
  output,
  buckets,
  dates,
  key,
  connectionString,
}: {
  input: string;
  output: string;
  buckets: number[];
  dates: string[];
  key: string;
  connectionString: string;
}) {
  const bufferPrecision = 0.001; // ~100m
  const simplifyPrecision = 0.0001; // ~10m
  const divideMaxVertices = 2048;

  const files = (await fs.promises.readdir(path.join(input, dates[0], buckets[0].toString()))).filter((s) =>
    s.match(/\.json/)
  );
  await createOutputFolder(output, buckets);

  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
    }),
  });
  const db = new Kysely({ dialect, log: formatLog });

  // Enable PostGis
  await sql`CREATE EXTENSION IF NOT EXISTS "postgis";`.execute(db);

  await oleoduc(
    Readable.from(files),
    // Verify file for each buckets
    transformData(async (file) => {
      const name = file.replace(/\.json$/, "");
      try {
        const data = await Promise.all(buckets.map(async (bucket) => getGeometry(db, input, dates, bucket, file, key)));
        return { uai: name, data };
      } catch (err) {
        logger.error(err.message);
        return null;
      }
    }),
    filterData((d) => d),
    transformData(
      async ({ uai, data }) => {
        const result = await db
          .selectFrom(() => {
            return db
              .selectNoFrom((eb) => {
                return data.map(({ geometry, bucket }) => {
                  return kyselyChainFn(
                    eb,
                    [
                      { fn: "ST_GeomFromGeoJSON", args: [] },
                      { fn: "ST_Buffer", args: [eb.val(bufferPrecision)] },
                      { fn: "ST_Simplify", args: [eb.val(simplifyPrecision), eb.val(true)] },
                      { fn: "ST_MakeValid", args: [eb.val("method=structure")] },
                    ],
                    sql`${geometry}`
                  ).as(bucket.toString());
                });
              })
              .as("buckets");
          })
          .select(({ eb }) => {
            return data.map(({ bucket }, index) => {
              return kyselyChainFn(
                eb,
                [
                  ...(index < data.length - 1
                    ? [
                        {
                          fn: "ST_Difference",
                          args: [`buckets.${data[index + 1].bucket}`],
                        },
                      ]
                    : []),
                  { fn: "ST_Subdivide", args: [eb.val(divideMaxVertices)] },
                  { fn: "ST_MakeValid", args: [] },
                  { fn: "ST_AsGeoJSON", args: [] },
                ],
                `buckets.${bucket}`
              ).as(bucket.toString());
            });
          })
          .execute();
        return { result, uai };
      },
      { parallel: 10 }
    ),
    writeData(async ({ result, uai }) => {
      for (const index in result) {
        const r = result[index];
        for (const bucket of Object.keys(r)) {
          if (!r[bucket]) {
            continue;
          }
          await fs.promises.writeFile(path.join(output, bucket, `${uai}_${index.padStart(4, "0")}.json`), r[bucket]);
        }
      }
      logger.info(`Découpage et simplification de ${uai} fini.`);
    })
  );

  await db.destroy();
}
