import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE TYPE FORMATION_ETABLISSEMENT_STATE AS ENUM('updated', 'update_waiting');

	ALTER TABLE "formationEtablissement" 
		ADD COLUMN "state" FORMATION_ETABLISSEMENT_STATE NOT NULL DEFAULT 'updated';
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formationEtablissement"
		DROP COLUMN IF EXISTS "state";

	DROP TYPE IF EXISTS FORMATION_ETABLISSEMENT_STATE;
	`.compile(db)
  );
}
