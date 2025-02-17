import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurEntree" 
		ADD COLUMN "voeux" integer,
    DROP COLUMN IF EXISTS "effectifsAnnee";
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurEntree"
		DROP COLUMN IF EXISTS "voeux",
    ADD COLUMN "effectifsAnnee" varchar;
	`.compile(db)
  );
}
