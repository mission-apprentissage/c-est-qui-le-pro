import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "etablissement" 
		ADD COLUMN "region" varchar(2) NOT NULL DEFAULT '0';

	ALTER TABLE "formation" 
		ADD COLUMN "niveauDiplome" varchar(3) NOT NULL DEFAULT '0';
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "etablissement"
		DROP COLUMN IF EXISTS "region";

	ALTER TABLE "formation"
		DROP COLUMN IF EXISTS "niveauDiplome";
	`.compile(db)
  );
}
