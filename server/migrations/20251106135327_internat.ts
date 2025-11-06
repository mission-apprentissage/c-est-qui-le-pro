import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "etablissement" 
		ADD COLUMN "hasFormationWithHebergement" boolean NOT NULL DEFAULT false;

	ALTER TABLE "formationEtablissement" 
		ADD COLUMN "hasHebergement" boolean NOT NULL DEFAULT false;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "etablissement"
	  		DROP COLUMN IF EXISTS "hasFormationWithHebergement";

		ALTER TABLE "formationEtablissement"
	  		DROP COLUMN IF EXISTS "hasHebergement";
	`.compile(db)
  );
}
