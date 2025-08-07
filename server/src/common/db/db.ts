import {
  Kysely,
  PostgresDialect,
  ExpressionWrapper,
  RawBuilder,
  AnyColumn,
  OnConflictDatabase,
  OnConflictTables,
  SelectQueryBuilder,
} from "kysely";
import pg from "pg";
import Cursor from "pg-cursor";
import { DB } from "./schema";
import config from "#src/config.js";
import { logger } from "#src/common/logger.js";
import { InsertExpression } from "kysely/dist/cjs/parser/insert-values-parser";
import { UpdateObjectExpression } from "kysely/dist/cjs/parser/update-set-parser";

const { Pool, types } = pg;

//Convert numeric to number
types.setTypeParser(types.builtins.NUMERIC, function (val) {
  return parseFloat(val);
});

export interface DBWithMaterializedViews extends Omit<DB, "formationFamilleMetierView"> {
  formationFamilleMetierMView: DB["formationFamilleMetierView"];
}

export const pool = new Pool({
  connectionString: config.pgsql.uri,
  ssl: config.pgsql.ca ? { rejectUnauthorized: false, ca: config.pgsql.ca } : undefined,
});

pool.on("error", (error) => {
  try {
    console.error("lost connection with DB!");
    logger.error("pg pool lost connexion with database", { error });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // Do not crash if we can't log
  }
});

export function formatLog(event) {
  if (config.sql.logLevel.includes(event.level)) {
    console.log(`\n====================================\n`);
    console.log(replaceQueryPlaceholders(event.query.sql, event.query.parameters as string[]));
    console.log({
      parameters: event.query.parameters.map((p, index) => `$${index + 1} = ${p}`).join(", "),
    });
    console.log({ duration: event.queryDurationMillis });
  }
}

export const kdb = new Kysely<DBWithMaterializedViews>({
  dialect: new PostgresDialect({ pool, cursor: Cursor }),
  log: formatLog,
});

function replaceQueryPlaceholders(query: string, values: string[]): string {
  let modifiedQuery = query;

  // Replace each placeholder with the corresponding value from the array
  values.forEach((value, index) => {
    // The placeholder in the query will be like $1, $2, etc.
    const placeholder = `$${index + 1}`;
    modifiedQuery = modifiedQuery.replace(
      placeholder,
      Array.isArray(value) ? `'{${value.map((v) => `"${v}"`).join(",")}}'` : `'${value}'`
    );
  });

  return modifiedQuery;
}

export function kyselyChainFn<T extends keyof DB>(
  eb,
  fns: {
    fn: string;
    args: (
      | ExpressionWrapper<unknown, never, any>
      | string
      | RawBuilder<unknown>
      | SelectQueryBuilder<unknown, never, any>
    )[];
  }[],
  val: RawBuilder<unknown> | string | ExpressionWrapper<unknown, never, any> | undefined = undefined
): ExpressionWrapper<DB, T, unknown> {
  return fns.reduce((acc, { fn, args }) => {
    return eb.fn(fn, [...(acc !== undefined ? [acc] : []), ...args]);
  }, val);
}

export async function upsert<DB, T extends keyof DB>(
  kdb: Kysely<DB>,
  table: T & string,
  keys: AnyColumn<DB, T>[],
  data: InsertExpression<DB, T & string>,
  onConflictData: UpdateObjectExpression<OnConflictDatabase<DB, T>, OnConflictTables<T>, OnConflictTables<T>> = null,
  returningKeys: AnyColumn<DB, T>[] = null
) {
  const withReturning = (query, returningKeys) => (returningKeys ? query.returning(returningKeys) : query);
  const withConflictData = (query, keys, data) =>
    data
      ? query.onConflict((oc) => oc.columns(keys).doUpdateSet(onConflictData))
      : query.onConflict((oc) => oc.columns(keys).doNothing());

  const query = withConflictData(
    withReturning(kdb.insertInto(table).values(data), returningKeys),
    keys,
    onConflictData
  );

  return query.executeTakeFirst();
}
