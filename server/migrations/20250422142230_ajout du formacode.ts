import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formation" 
		ADD COLUMN "formacode" varchar;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formation"
		DROP COLUMN IF EXISTS "formacode";
	`.compile(db)
  );
}
