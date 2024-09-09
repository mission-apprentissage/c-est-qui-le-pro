import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser.js";

export class MetricRepository extends SqlRepository<DB, "metric"> {
  constructor(kdb = defaultKdb) {
    super(
      "metric",
      {
        id: null,
        time: null,
        url: null,
        consumer: null,
        uai: null,
        uais: null,
        cfd: null,
        cfds: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async insert(data: InsertExpression<DB, "metric">) {
    return this.kdb.insertInto("metric").values(data).returningAll().execute();
  }
}

export default new MetricRepository();
