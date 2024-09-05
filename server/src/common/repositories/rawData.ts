import flat from "flat";
import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB } from "../db/schema.js";
import { sql } from "kysely";
import { Readable } from "stream";
import { compose } from "oleoduc";

export enum RawDataType {
  CatalogueApprentissage = "CatalogueApprentissage",
  ACCE = "ACCE",

  ONISEP_tablePassageCodesCertifications = "ONISEP_tablePassageCodesCertifications",
  ONISEP_ideoActionsFormationInitialeUniversLycee = "ONISEP_ideoActionsFormationInitialeUniversLycee",
  ONISEP_ideoStructuresEnseignementSecondaire = "ONISEP_ideoStructuresEnseignementSecondaire",
  ONISEP_ideoFormationsInitiales = "ONISEP_ideoFormationsInitiales",

  BCN = "BCN",
  BCN_MEF = "BCN_MEF",
}
export interface RawData {
  [RawDataType.CatalogueApprentissage]: any;
  [RawDataType.BCN]: any;
  [RawDataType.BCN_MEF]: any;
  [RawDataType.ACCE]: any;
  [RawDataType.ONISEP_tablePassageCodesCertifications]: any;
  [RawDataType.ONISEP_ideoActionsFormationInitialeUniversLycee]: any;
  [RawDataType.ONISEP_ideoStructuresEnseignementSecondaire]: any;
  [RawDataType.ONISEP_ideoFormationsInitiales]: any;
}

export class RawDataRepository extends SqlRepository<DB, "rawData"> {
  constructor(kdb = defaultKdb) {
    super(
      "rawData",
      {
        id: null,
        type: null,
        data: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }

  async deleteAll(type: RawDataType) {
    return this.kdb.deleteFrom("rawData").where("type", "=", type).returningAll().execute();
  }

  async insert<T extends RawDataType>(type: T, data: RawData[T]) {
    return this.kdb
      .insertInto("rawData")
      .values({
        type,
        data,
      })
      .returningAll()
      .execute();
  }

  _createJsonFilter(query, filters) {
    const filtersArray = flat.flatten(filters);

    for (const [key, value] of Object.entries(filtersArray)) {
      const keyPart = key.split(".");

      query = query.where(
        sql.raw(`data${keyPart.map((k, i) => (i === keyPart.length - 1 ? ` ->> '${k}'` : ` -> '${k}'`)).join("")}`),
        "=",
        value.toString()
      );
    }

    return query;
  }

  async search<T extends RawDataType>(type: T, filters: Partial<RawData[T]> = {}, returnStream = true) {
    let query = this.kdb.selectFrom("rawData").selectAll().where("type", "=", type);
    query = this._createJsonFilter(query, filters);

    if (!returnStream) {
      return query.execute();
    }

    return compose(Readable.from(query.stream()));
  }

  async first<T extends RawDataType>(type: T, filters: Partial<RawData[T]> = {}) {
    let query = this.kdb.selectFrom("rawData").selectAll().where("type", "=", type);
    query = this._createJsonFilter(query, filters);
    return query.limit(1).executeTakeFirst();
  }

  async update<T extends RawDataType>(type: T, data: RawData[T], filters: Partial<RawData[T]> = {}) {
    let query = this.kdb
      .updateTable("rawData")
      .set({
        type,
        data,
      })
      .where("type", "=", type);

    query = this._createJsonFilter(query, filters);

    return query.returningAll().execute();
  }
}

export default new RawDataRepository();
