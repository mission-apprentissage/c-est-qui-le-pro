import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "etablissementIsochrone" 
		ADD COLUMN "modalite" VARCHAR NOT NULL DEFAULT 'transport';
	CREATE INDEX "etablissementIsochrone_modalite_idx" ON "etablissementIsochrone" ("modalite");
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		DROP INDEX "etablissementIsochrone_modalite_idx";

		ALTER TABLE "etablissementIsochrone"
			DROP COLUMN IF EXISTS "modalite";
	`.compile(db)
  );
}
