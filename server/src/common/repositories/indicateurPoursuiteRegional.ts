import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";
import { DiplomeType, FormationVoie } from "shared";
import { sql } from "kysely";

export class IndicateurPoursuiteRegionalRepository extends SqlRepository<DB, "indicateurPoursuiteRegional"> {
  constructor(kdb = defaultKdb) {
    super(
      "indicateurPoursuiteRegional",
      {
        id: null,
        cfd: null,
        voie: null,
        codeDispositif: null,
        region: null,
        millesime: null,
        taux_en_emploi_6_mois: null,
        taux_en_formation: null,
        taux_autres_6_mois: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  quartileFor(type: keyof typeof DiplomeType, region?: string, voie?: FormationVoie) {
    let query = this.kdb
      .selectFrom("indicateurPoursuiteRegional")
      .distinctOn(["region", "voie"])
      .select(["millesime", "region", "voie"])
      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY taux_en_formation)`.as("taux_en_formation_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY taux_en_formation)`.as("taux_en_formation_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY taux_en_formation)`.as("taux_en_formation_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY taux_en_formation)`.as("taux_en_formation_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY taux_en_formation)`.as("taux_en_formation_q4"))
      .select(
        sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY taux_en_emploi_6_mois)`.as("taux_en_emploi_6_mois_q0")
      )
      .select(
        sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY taux_en_emploi_6_mois)`.as("taux_en_emploi_6_mois_q1")
      )
      .select(
        sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY taux_en_emploi_6_mois)`.as("taux_en_emploi_6_mois_q2")
      )
      .select(
        sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY taux_en_emploi_6_mois)`.as("taux_en_emploi_6_mois_q3")
      )
      .select(
        sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY taux_en_emploi_6_mois)`.as("taux_en_emploi_6_mois_q4")
      )

      .where("taux_en_formation", "is not", null)
      .where(this.kdb.fn("SUBSTR", ["cfd", sql.val(1), sql.val(3)]), "in", DiplomeType[type]);
    query = region ? query.where("region", "=", region) : query;
    query = voie ? query.where("voie", "=", voie) : query;
    return query
      .groupBy(["region", "voie", "millesime"])
      .orderBy(["region", "voie", "millesime desc"])
      .limit(1)
      .executeTakeFirst();
  }
}

export default new IndicateurPoursuiteRegionalRepository();