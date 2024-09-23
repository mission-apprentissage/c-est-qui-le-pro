import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formation" 
		ADD COLUMN "descriptionAcces" varchar,
		ADD COLUMN "descriptionPoursuiteEtudes" varchar;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formation"
		DROP COLUMN IF EXISTS "descriptionAcces",
		DROP COLUMN IF EXISTS "descriptionPoursuiteEtudes";
	`.compile(db)
  );
}
