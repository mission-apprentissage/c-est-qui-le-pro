import { mapKeys, pickBy } from "lodash-es";
import { AnyAliasedColumn, AnyColumn, ExpressionBuilder, Kysely, OnConflictDatabase, OnConflictTables } from "kysely";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";
import { ExtractTableAlias } from "kysely/dist/cjs/parser/table-parser";
import { upsert } from "../db/db";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser";
import { Readable } from "stream";
import { compose, transformData } from "oleoduc";
import { Entries } from "shared";

export class Repository {}

export class SqlRepository<DB, F extends keyof DB> extends Repository {
  fields: DB[F];
  kdb: Kysely<DB>;
  tableName: F & string;
  constructor(tableName: F & string, fields: DB[F], kdb) {
    super();
    this.kdb = kdb;
    this.tableName = tableName;
    this.fields = fields;
  }

  async insert(data: InsertExpression<DB, F & string>) {
    return this.kdb.insertInto(this.tableName).values(data).returningAll().execute();
  }

  async remove(where: Partial<DB[F]>) {
    const query = this.kdb.deleteFrom(this.tableName);
    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;
    return queryCond.returningAll().execute();
  }

  async find(where: Partial<DB[F]>, returnStream = true) {
    const query = this.kdb.selectFrom(this.tableName).selectAll();
    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;

    if (!returnStream) {
      return queryCond.execute();
    }

    return compose(Readable.from(queryCond.stream()));
  }

  async first(where: Partial<DB[F]>) {
    const query = this.kdb.selectFrom(this.tableName).selectAll();
    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;

    return queryCond.limit(1).executeTakeFirst();
  }

  async upsert(
    keys: AnyColumn<DB, F>[],
    data: InsertExpression<DB, F & string>,
    onConflictData: UpdateObjectExpression<OnConflictDatabase<DB, F>, OnConflictTables<F>, OnConflictTables<F>> = null,
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
          ExtractTableAlias<DB, F & string>,
          ExtractTableAlias<DB, F & string>
        >
      );

    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;

    return queryCond.returningAll().execute();
  }

  async getAll(returnStream = true) {
    const query = this.kdb.selectFrom(this.tableName).select((eb) => this.getKeyAlias(eb));

    if (!returnStream) {
      return (await query.execute()).map((result) => this.getColumnWithoutAlias(this.tableName, result));
    }

    return compose(
      Readable.from(query.stream()),
      transformData((result) => {
        return this.getColumnWithoutAlias(this.tableName, result);
      })
    );
  }

  getKeyAlias<T extends keyof DB>(_eb: ExpressionBuilder<DB, T>) {
    const keys = Object.keys(this.fields) as Array<keyof typeof this.fields>;
    return keys.map(
      (k) => `${this.tableName}.${k.toString()} as ${this.tableName}.${k.toString()}` as AnyAliasedColumn<DB, T>
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

  _base(_options: any) {
    throw new Error("Base repository not implemented for this repository");
  }
}
