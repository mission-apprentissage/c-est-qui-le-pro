import { SqlRepository } from "./base.js";
import { kdb as defaultKdb, kyselyChainFn } from "../db/db";
import { DB } from "../db/schema.js";
import { sql } from "kysely";

export class EtablissementIsochroneRepository extends SqlRepository<DB, "etablissementIsochrone"> {
  constructor(kdb = defaultKdb) {
    super(
      "etablissementIsochrone",
      {
        id: null,
        etablissementId: null,
        bucket: null,
        geom: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async bucketFromCoordinate(etablissementId: string, latitude: number, longitude: number) {
    const result = await this.kdb
      .selectFrom(this.tableName)
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
      .where("etablissementId", "=", etablissementId)
      .select("bucket")
      .executeTakeFirst();

    return result ? result.bucket : null;
  }
}

export default new EtablissementIsochroneRepository();
