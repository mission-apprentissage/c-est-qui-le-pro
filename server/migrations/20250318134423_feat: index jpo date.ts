import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE INDEX "etablissementJPODate_etablissementId_idx" ON "etablissementJPODate" ("etablissementId");
	CREATE INDEX "etablissementIsochrone_etablissementId_idx" ON "etablissementIsochrone" ("etablissementId");
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP INDEX "etablissementJPODate_etablissementId_idx";
	DROP INDEX "etablissementIsochrone_etablissementId_idx";
	`.compile(db)
  );
}
