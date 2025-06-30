import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "etablissement" 
		ADD COLUMN "type" VARCHAR NOT NULL DEFAULT 'LP';
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "etablissement"
	  		DROP COLUMN IF EXISTS "type";
	`.compile(db)
  );
}
