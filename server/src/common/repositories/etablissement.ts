import { SqlRepository } from "./base.js";
import { kdb as defaultKdb, kyselyChainFn } from "../db/db.js";
import { DB } from "../db/schema.js";
import { SelectQueryBuilder, sql } from "kysely";

export class EtablissementRepository extends SqlRepository<DB, "etablissement"> {
  constructor(kdb = defaultKdb) {
    super(
      "etablissement",
      {
        academie: null,
        addressCedex: null,
        addressCity: null,
        addressPostCode: null,
        addressStreet: null,
        coordinate: null,
        createdAt: null,
        id: null,
        JPODetails: null,
        libelle: null,
        onisepId: null,
        statut: null,
        statutDetail: null,
        uai: null,
        updatedAt: null,
        url: null,
        hasFormation: null,
      },
      kdb
    );
  }

  customFields(eb, withAlias = false) {
    return [
      eb.fn("ST_X", ["coordinate"]).as(`${withAlias ? this.tableName + "." : ""}longitude`),
      eb.fn("ST_Y", ["coordinate"]).as(`${withAlias ? this.tableName + "." : ""}latitude`),
    ];
  }

  _base() {
    return <T extends SelectQueryBuilder<DB, "etablissement", object>>(eb: T) => {
      return eb
        .select((eb) => this.customFields(eb))
        .leftJoinLateral(
          (eb) =>
            eb
              .selectFrom("etablissementJPODate")
              .select((eb) => {
                return [
                  kyselyChainFn(
                    eb,
                    [
                      { fn: "to_jsonb", args: [] },
                      { fn: "json_agg", args: [] },
                    ],
                    sql`"etablissementJPODate"`
                  ).as("JPODates"),
                ];
              })
              .whereRef("etablissement.id", "=", "etablissementJPODate.etablissementId")
              .as("JPODates"),
          (join) => join.on(sql`true`)
        );
    };
  }

  async get({ uai }) {
    const etablissement = await this.kdb
      .selectFrom("etablissement")
      .$call(this._base())
      .selectAll()
      .where("uai", "=", uai)
      .executeTakeFirst();
    return etablissement;
  }

  getKeyRelationAlias() {
    return [`JPODates as ${this.tableName}.JPODates`];
  }

  getKeyAlias(eb) {
    return [...super.getKeyAlias(eb), ...this.customFields(eb, true)];
  }
}

export default new EtablissementRepository();
