import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurPoursuite" ALTER COLUMN "part_en_emploi_6_mois" TYPE real USING "part_en_emploi_6_mois"::text::real;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "indicateurPoursuite" ALTER COLUMN "part_en_emploi_6_mois" TYPE varchar USING "part_en_emploi_6_mois";
	`.compile(db)
  );
}
