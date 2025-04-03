import { SqlRepository } from "./base.js";
import { kdb as defaultKdb, upsert } from "../db/db.js";
import { DB } from "../db/schema.js";
import diacritics from "diacritics";
import { InsertObject } from "kysely/dist/cjs/parser/insert-values-parser.js";

export class FormationKeywordRepository extends SqlRepository<DB, "formationKeyword"> {
  constructor(kdb = defaultKdb) {
    super(
      "formationKeyword",
      {
        formationId: null,
        keyword: null,
        weight: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async upsert(data: InsertObject<DB, "formationKeyword">) {
    const formattedData = {
      ...data,
      ...(data.keyword ? { keyword: diacritics.remove(data.keyword).toLowerCase() } : {}),
    };

    return upsert(this.kdb, "formationKeyword", ["formationId", "keyword"], formattedData, formattedData);
  }

  async formationIdsByKeywordAndWeight() {
    return this.kdb
      .selectFrom("formationKeyword")
      .select(["keyword", "weight"])
      .select((eb) => eb.fn.agg<string[]>("array_agg", ["formationId"]).as("formationIds"))
      .groupBy(["keyword", "weight"])
      .stream();
  }
}

export default new FormationKeywordRepository();
