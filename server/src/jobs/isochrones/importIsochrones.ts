import fs from "fs";
import { oleoduc, writeData, transformData, flattenArray } from "oleoduc";
import { Readable } from "stream";
import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import path from "path";
import { getLoggerWithContext } from "#src/common/logger.js";
import { DB } from "#src/common/db/schema.js";

const logger = getLoggerWithContext("isochrones");

export async function importIsochrones({
  input,
  buckets,
  connectionString,
  caPath,
}: {
  input: string;
  buckets: number[];
  connectionString: string;
  caPath: string;
}) {
  const ca = caPath ? await fs.promises.readFile(caPath) : null;
  const dialect = new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
      ssl: ca ? { rejectUnauthorized: false, ca: ca } : undefined,
    }),
  });
  const db = new Kysely<DB>({ dialect });

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
            .returningAll()
            .execute();
          logger.info(`Anciens polygones pour ${uai} supprimés`);
        }

        const data = await fs.promises.readFile(path.join(input, bucket.toString(), file), "utf-8");

        await db
          .insertInto("etablissementIsochrone")
          .columns(["etablissementId", "bucket", "geom"])
          .expression((eb) =>
            eb
              .selectFrom("etablissement")
              .select((eb) => ["id as etablissementId", eb.val(bucket).as("bucket"), eb.val(data).as("geom")])
              .where("uai", "=", uai)
          )
          .executeTakeFirst();

        logger.info(`Polygones pour ${uai} ajoutés`);
      } catch (err) {
        logger.error(`Impossible d'importer les polygones pour ${uai}/${bucket}, fichier : ${file}`, err);
      }
    })
  );

  await db.destroy();
}
