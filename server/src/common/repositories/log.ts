import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB } from "../db/schema.js";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser.js";

export class LogRepository extends SqlRepository<DB, "log"> {
  constructor(kdb = defaultKdb) {
    super(
      "log",
      {
        id: null,
        data: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async insert(data: InsertExpression<DB, "log">) {
    return this.kdb.insertInto("log").values(data).returningAll().execute();
  }
}

export default new LogRepository();
