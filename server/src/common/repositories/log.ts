import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB } from "../db/schema.js";

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
}

export default new LogRepository();
