import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE TYPE ROME_METIER_STATE AS ENUM('updated', 'update_waiting');

	ALTER TABLE "romeMetier" 
		ADD COLUMN "state" ROME_METIER_STATE NOT NULL DEFAULT 'updated';
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "romeMetier"
		DROP COLUMN IF EXISTS "state";

	DROP TYPE IF EXISTS ROME_METIER_STATE;
	`.compile(db)
  );
}
