import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

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
}

export default new MetricRepository();
