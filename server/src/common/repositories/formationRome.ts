import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class FormationRomeRepository extends SqlRepository<DB, "formationRome"> {
  constructor(kdb = defaultKdb) {
    super(
      "formationRome",
      {
        formationId: null,
        rome: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new FormationRomeRepository();
