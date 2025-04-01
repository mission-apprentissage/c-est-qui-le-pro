import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurPoursuiteAnneeCommune" ADD COLUMN "libelle" VARCHAR;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "indicateurPoursuiteAnneeCommune"
			DROP COLUMN IF EXISTS "libelle";
	`.compile(db)
  );
}
