import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurPoursuiteRegional" 
    ADD COLUMN "libelle" VARCHAR,
		ADD COLUMN "type" varchar  NOT NULL DEFAULT 'self';
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "indicateurPoursuiteRegional"
      DROP COLUMN IF EXISTS "libelle",
			DROP COLUMN IF EXISTS "type";
	`.compile(db)
  );
}
