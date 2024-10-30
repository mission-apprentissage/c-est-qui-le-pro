import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE EXTENSION IF NOT EXISTS "unaccent";

	CREATE EXTENSION IF NOT EXISTS "pg_trgm";

	CREATE OR REPLACE FUNCTION f_unaccent(text)
	RETURNS text
	LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT AS
	$func$
	SELECT unaccent('unaccent', $1)  -- schema-qualify function and dictionary
	$func$;

	CREATE INDEX "formation_unaccent_libelle_gin" ON "formation" USING gin (f_unaccent("libelle") gin_trgm_ops);
	
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP INDEX "formation_unaccent_libelle_gin";
	`.compile(db)
  );
}
