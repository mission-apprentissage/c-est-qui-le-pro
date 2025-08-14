import fs from "fs";
import { oleoduc, writeData, transformData, flattenArray } from "oleoduc";
import { Readable } from "stream";
import { Kysely, PostgresDialect, sql } from "kysely";
import pg from "pg";
import path from "path";
import { getLoggerWithContext } from "#src/common/logger.js";
import { DB } from "#src/common/db/schema.js";
import { formatLog, kyselyChainFn } from "#src/common/db/db.js";

const logger = getLoggerWithContext("isochrones");

function queryScolaire(db: Kysely<DB>, uai: string, data) {
  // Create a geometry from a geometry with geometry not scolaire substract
  const bufferPrecision = 0.0002; // ~20m

  return db
    .selectFrom(() =>
      db
        .selectFrom(() =>
          db
            .selectNoFrom((eb) => {
              return kyselyChainFn(
                eb,
                [
                  {
                    fn: "ST_Difference",
                    args: [
                      eb
                        .selectFrom(() =>
                          db
                            .selectFrom("etablissementIsochrone")
                            .where("modalite", "=", "transport")
                            .where(
                              "etablissementId",
                              "=",
                              eb.fn.any(eb.selectFrom("etablissement").select("id").where("uai", "=", uai))
                            )
                            .select("geom")
                            .as("geometry")
                        )
                        .select(({ eb }) => {
                          return kyselyChainFn(
                            eb,
                            [
                              { fn: "ST_Buffer", args: [eb.val(bufferPrecision)] }, // On ajoute un buffer pour supprimer les artefacts de précision lorsque l'on fait la différence entre les isochrones
                              { fn: "ST_Union", args: [] },
                              {
                                fn: "COALESCE",
                                args: [
                                  kyselyChainFn(
                                    eb,
                                    [
                                      {
                                        fn: "ST_GeomFromText",
                                        args: [sql.val(4326)],
                                      },
                                    ],
                                    sql.val("POLYGON EMPTY")
                                  ),
                                ],
                              },
                            ],
                            sql.ref("geometry.geom")
                          ).as("geom");
                        }),
                    ],
                  },
                ],
                kyselyChainFn(
                  eb,
                  [
                    { fn: "ST_GeomFromGeoJSON", args: [] },
                    { fn: "ST_MakeValid", args: [eb.val("method=structure")] },
                  ],
                  sql.val(data)
                )
              ).as("geom");
            })
            .as("geom")
        )
        .select("geom")
        .select((eb) => kyselyChainFn(eb, [{ fn: "ST_IsEmpty", args: [] }], "geom").as("empty"))
        .as("geometry")
    )
    .select("geom")
    .where(sql.ref("empty"), "is", false);
}

export async function importIsochrones({
  input,
  buckets,
  connectionString,
  caPath,
  modalite,
}: {
  input: string;
  buckets: number[];
  connectionString: string;
  caPath: string;
  modalite: "transport" | "scolaire";
}) {
  const stats = { total: 0, inserted: 0, failed: 0, ignored: 0 };

  const ca = caPath ? await fs.promises.readFile(caPath) : null;
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      ssl: ca ? { rejectUnauthorized: false, ca: ca } : undefined,
    }),
  });
  const db = new Kysely<DB>({ dialect, log: formatLog });

  const isRenewed = new Set();

  await oleoduc(
    Readable.from(buckets),
    transformData(async (bucket) => {
      const files = (await fs.promises.readdir(path.join(input, bucket.toString()))).filter((s) => s.match(/\.json/));

      return files.map((file) => ({
        bucket,
        file,
      }));
    }),
    flattenArray(),

    writeData(async ({ bucket, file }) => {
      const uai = file.split("_")[0];

      stats.total++;

      try {
        if (!isRenewed.has(uai)) {
          isRenewed.add(uai);

          await db
            .deleteFrom("etablissementIsochrone")
            .where((eb) => {
              return eb(
                "etablissementId",
                "=",
                eb.fn.any(eb.selectFrom("etablissement").select("id").where("uai", "=", uai))
              );
            })
            .where("modalite", "=", modalite)
            .returningAll()
            .execute();
          logger.info(`Anciens polygones pour ${uai} supprimés`);
        }

        const data = await fs.promises.readFile(path.join(input, bucket.toString(), file), "utf-8");

        const dataToInsert =
          modalite === "scolaire" ? (await queryScolaire(db, uai, data).executeTakeFirst())?.geom : data;

        if (dataToInsert) {
          await db
            .insertInto("etablissementIsochrone")
            .columns(["etablissementId", "bucket", "geom", "modalite"])
            .expression((eb) =>
              eb
                .selectFrom("etablissement")
                .select((eb) => [
                  "id as etablissementId",
                  eb.val(bucket).as("bucket"),
                  eb.val(dataToInsert).as("geom"),
                  eb.val(modalite).as("modalite"),
                ])
                .where("uai", "=", uai)
            )
            .executeTakeFirst();

          stats.inserted++;
          logger.info(`Polygones pour ${uai} ajoutés`);
        } else {
          stats.ignored++;
          logger.info(`Aucun polygones pour ${uai} à ajouter`);
        }
      } catch (err) {
        stats.failed++;
        logger.error(`Impossible d'importer les polygones pour ${uai}/${bucket}, fichier : ${file}`, err);
      }
    })
  );

  await db.destroy();

  logger.info(stats);
}
