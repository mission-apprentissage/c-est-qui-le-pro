import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";
import { DiplomeType, FormationVoie } from "shared";
import { sql } from "kysely";
import { merge } from "lodash-es";

export class IndicateurPoursuiteNationalRepository extends SqlRepository<DB, "indicateurPoursuiteNational"> {
  constructor(kdb = defaultKdb) {
    super(
      "indicateurPoursuiteNational",
      {
        id: null,
        cfd: null,
        voie: null,
        codeDispositif: null,
        millesime: null,
        taux_en_emploi_6_mois: null,
        taux_en_formation: null,
        taux_autres_6_mois: null,
        part_en_emploi_6_mois: null,
        salaire_12_mois_q1: null,
        salaire_12_mois_q2: null,
        salaire_12_mois_q3: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async quartileFor(type: keyof typeof DiplomeType, voie?: FormationVoie) {
    let query = this.kdb
      .selectFrom("indicateurPoursuiteNational")
      .select(["millesime"])
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
      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q4"))

      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q4"))
      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q4"))

      .where("taux_en_formation", "is not", null)
      .where(this.kdb.fn("SUBSTR", ["cfd", sql.val(1), sql.val(3)]), "in", DiplomeType[type]);
    query = voie ? query.where("voie", "=", voie) : query;
    const result = await query.groupBy(["millesime"]).orderBy(["millesime desc"]).limit(1).executeTakeFirst();
    return result ? merge({}, result, { voie }) : result;
  }

  async quartileForSalaire(type: keyof typeof DiplomeType, voie?: FormationVoie) {
    let query = this.kdb
      .selectFrom("indicateurPoursuiteNational")
      .select(["millesime"])
      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q1)`.as("salaire_12_mois_q1_q4"))

      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q2)`.as("salaire_12_mois_q2_q4"))
      .select(sql<number>`PERCENTILE_CONT(0) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q0"))
      .select(sql<number>`PERCENTILE_CONT(0.25) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q1"))
      .select(sql<number>`PERCENTILE_CONT(0.5) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q2"))
      .select(sql<number>`PERCENTILE_CONT(0.75) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q3"))
      .select(sql<number>`PERCENTILE_CONT(1) WITHIN GROUP(ORDER BY salaire_12_mois_q3)`.as("salaire_12_mois_q3_q4"))

      .where("salaire_12_mois_q1", "is not", null)
      .where(this.kdb.fn("SUBSTR", ["cfd", sql.val(1), sql.val(3)]), "in", DiplomeType[type]);
    query = voie ? query.where("voie", "=", voie) : query;
    const result = await query.groupBy(["millesime"]).orderBy(["millesime desc"]).limit(1).executeTakeFirst();
    return result ? merge({}, result, { voie }) : result;
  }
}

export default new IndicateurPoursuiteNationalRepository();
