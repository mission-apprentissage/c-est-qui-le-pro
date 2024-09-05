import { mapKeys, pickBy } from "lodash-es";
import { AnyAliasedColumn, AnyColumn, ExpressionBuilder, Kysely, OnConflictDatabase, OnConflictTables } from "kysely";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { upsert } from "../db/db";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser";
import { Entries } from "../utils/tsUtils";

export class Repository {}

export class SqlRepository<DB, F extends keyof DB> extends Repository {
  fields: DB[F];
  kdb: Kysely<DB>;
  tableName: keyof DB & string;
  constructor(tableName: keyof DB & string, fields: DB[F], kdb) {
    super();
    this.kdb = kdb;
    this.tableName = tableName;
    this.fields = fields;
  }

  async upsert(
    keys: AnyColumn<DB, F>[],
    data: InsertExpression<DB, keyof DB & string>,
    onConflictData: UpdateObjectExpression<
      OnConflictDatabase<DB, keyof DB & string>,
      OnConflictTables<keyof DB & string>,
      OnConflictTables<keyof DB & string>
    > = null,
    returningKeys: AnyColumn<DB, F>[] = null
  ) {
    return upsert(this.kdb, this.tableName, keys, data, onConflictData, returningKeys);
  }

  updateBy(data: Partial<DB[F]>, where: Partial<DB[F]> | null = null) {
    const query = this.kdb
      .updateTable(this.tableName)
      .set(
        data as unknown as UpdateObjectExpression<
          DB,
          ExtractTableAlias<DB, keyof DB & string>,
          ExtractTableAlias<DB, keyof DB & string>
        >
      );

    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;

    return queryCond.returningAll().execute();
  }

  getKeyAlias(eb) {
    const keys = Object.keys(this.fields) as Array<keyof typeof this.fields>;
    return keys.map(
      (k) => `${this.tableName}.${k.toString()} as ${this.tableName}.${k.toString()}` as AnyAliasedColumn<DB, keyof DB>
    );
  }

  getColumnWithoutAlias(alias, data) {
    return mapKeys(
      pickBy(data, (v, k) => {
        return k.substring(0, alias.length + 1) == `${alias}.`;
      }),
      (v, k) => {
        return k.substring(alias.length + 1);
      }
    );
  }

  _createWhere<E extends ExpressionBuilder<DB, F>, T extends { [key in keyof DB[F]]: string }>(
    eb: E,
    query: Partial<T>,
    alias?: string
  ) {
    return (Object.entries(query) as Entries<typeof query>).map(([key, value]) => {
      if (value === null) {
        return eb(`${alias ? `${alias}.` : ""}${key.toString()}` as any, "is", null);
      }
      return eb(`${alias ? `${alias}.` : ""}${key.toString()}` as any, "=", value);
    });
  }

  _base() {
    throw new Error("Base repository not implemented for this repository");
  }
}
