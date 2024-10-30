import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class FamilleMetierRepository extends SqlRepository<DB, "familleMetier"> {
  constructor(kdb = defaultKdb) {
    super(
      "familleMetier",
      {
        id: null,
        code: null,
        libelle: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new FamilleMetierRepository();
