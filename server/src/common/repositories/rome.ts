import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class RomeRepository extends SqlRepository<DB, "rome"> {
  constructor(kdb = defaultKdb) {
    super(
      "rome",
      {
        rome: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new RomeRepository();
