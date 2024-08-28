import fs from "fs";
import { filterData, oleoduc, writeData, transformData } from "oleoduc";
import { Readable } from "stream";
import { get, flow } from "lodash-es";
import { getLoggerWithContext } from "#src/common/logger.js";

import { ExpressionWrapper, Kysely, PostgresDialect, RawBuilder, sql } from "kysely";
import pg from "pg";
import path from "path";

const logger = getLoggerWithContext("isochrones");

async function createOutputFolder(output, buckets) {
  for (const bucket of buckets) {
    const dir = path.join(output, bucket.toString());
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

async function getGeometry(input, bucket, file, key) {
  const data = JSON.parse(await fs.promises.readFile(path.join(input, bucket.toString(), file), "utf8"));
  const geometry = get(data, key);
  if (geometry === undefined) {
    throw new Error(`Le fichier ${bucket}/${file} est invalide.`);
  }
  return { bucket, geometry };
}

function kyselyChainFn(
  eb,
  fns: { fn: string; args: (ExpressionWrapper<unknown, never, any> | string)[] }[],
  val: RawBuilder<unknown> | string
) {
  return fns.reduce((acc, { fn, args }) => {
    return eb.fn(fn, [acc, ...args]);
  }, val);
}

export async function splitIsochrones({
  input,
  output,
  buckets,
  key,
  connectionString,
}: {
  input: string;
  output: string;
  buckets: number[];
  key: string;
  connectionString: string;
}) {
  const bufferPrecision = 0.001; // ~100m
  const simplifyPrecision = 0.0001; // ~10m
  const divideMaxVertices = 2048;

  console.log(input, output, buckets, key, connectionString);

  const files = (await fs.promises.readdir(path.join(input, buckets[0].toString()))).filter((s) => s.match(/\.json/));
  await createOutputFolder(output, buckets);

  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
    }),
  });
  const db = new Kysely({ dialect });

  await oleoduc(
    //Readable.from(files.slice(0, 1)),
    Readable.from(files),
    // Verify file for each buckets
    transformData(async (file) => {
      const name = file.replace(/\.json$/, "");
      try {
        const data = await Promise.all(buckets.map(async (bucket) => getGeometry(input, bucket, file, key)));
        return { uai: name, data };
      } catch (err) {
        logger.error(err.message);
        return null;
      }
    }),
    filterData((d) => d),
    transformData(async ({ uai, data }) => {
      const result = await db
        .selectFrom((eb) => {
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
        .select(({ eb, fn }) => {
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
                { fn: "ST_AsGeoJSON", args: [] },
              ],
              `buckets.${bucket}`
            ).as(bucket.toString());
          });
        })
        .execute();
      return { result, uai };
    }),
    writeData(
      async ({ result, uai }) => {
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
      },
      { parallel: 10 }
    )
  );

  await db.destroy();
}
