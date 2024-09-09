import { SqlRepository } from "./base.js";
import { kdb as defaultKdb, kyselyChainFn } from "../db/db";
import { DB } from "../db/schema.js";
import { AnyAliasedColumn, ExpressionBuilder, SelectQueryBuilder, sql } from "kysely";

export class FormationRepository extends SqlRepository<DB, "formation"> {
  constructor(kdb = defaultKdb) {
    super(
      "formation",
      {
        cfd: null,
        codeDiplome: null,
        codeDispositif: null,
        codeRncp: null,
        createdAt: null,
        description: null,
        id: null,
        libelle: null,
        mef11: null,
        onisepIdentifiant: null,
        updatedAt: null,
        voie: null,
      },
      kdb
    );
  }

  _base() {
    return <T extends SelectQueryBuilder<DB, "formation", {}>>(eb: T) => {
      return eb.leftJoinLateral(
        (eb) =>
          eb
            .selectFrom("formationDomaine")
            .innerJoin("domaine", "domaine.id", "formationDomaine.domaineId")
            .select((eb) => {
              return [
                kyselyChainFn(
                  eb,
                  [
                    { fn: "to_jsonb", args: [] },
                    { fn: "json_agg", args: [] },
                  ],
                  sql`domaine.*`
                ).as("domaine"),
              ];
            })
            .whereRef("formation.id", "=", "formationDomaine.formationId")
            .as("domaine"),
        (join) => join.on(sql`true`)
      );
    };
  }

  async get({ cfd, codeDispositif, voie }) {
    const formation = await this.kdb
      .selectFrom("formation")
      .$call(this._base())
      .selectAll()
      .where("cfd", "=", cfd)
      .where("voie", "=", voie)
      .where(({ eb }) => {
        return codeDispositif ? eb("codeDispositif", "=", codeDispositif) : eb("codeDispositif", "is", null);
      })
      .executeTakeFirst();

    return formation;
  }

  getKeyAlias<T extends keyof DB>(eb: ExpressionBuilder<DB, T>) {
    return [...super.getKeyAlias(eb)];
  }

  getKeyRelationAlias<T extends keyof DB>(eb: ExpressionBuilder<DB, T>) {
    return [`domaine as ${this.tableName}.domaine` as AnyAliasedColumn<DB, T>];
  }
}

export default new FormationRepository();
