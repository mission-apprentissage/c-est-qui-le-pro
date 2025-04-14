import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurPoursuite" ADD COLUMN "libelle" VARCHAR;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "indicateurPoursuite"
			DROP COLUMN IF EXISTS "libelle";
	`.compile(db)
  );
}
