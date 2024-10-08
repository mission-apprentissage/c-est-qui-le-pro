import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class FormationSimilaireRepository extends SqlRepository<DB, "formationSimilaire"> {
  constructor(kdb = defaultKdb) {
    super(
      "formationSimilaire",
      {
        formationId: null,
        formationRelatedId: null,
        similarityOrder: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new FormationSimilaireRepository();
