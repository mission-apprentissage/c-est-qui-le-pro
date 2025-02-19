import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "indicateurEntree"
	DROP CONSTRAINT "indicateurEntree_formationEtablissement_fk",
	ADD CONSTRAINT "indicateurEntree_formationEtablissement_fk"
		FOREIGN KEY ("formationEtablissementId")
		REFERENCES "formationEtablissement"(id)
		ON DELETE CASCADE;

   	ALTER TABLE "indicateurPoursuite"
	DROP CONSTRAINT "indicateurPoursuite_formationEtablissement_fk",
	ADD CONSTRAINT "indicateurPoursuite_formationEtablissement_fk"
		FOREIGN KEY ("formationEtablissementId")
		REFERENCES "formationEtablissement"(id)
		ON DELETE CASCADE;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		ALTER TABLE "indicateurEntree"
	DROP CONSTRAINT "indicateurEntree_formationEtablissement_fk",
	ADD CONSTRAINT "indicateurEntree_formationEtablissement_fk"
		FOREIGN KEY ("formationEtablissementId")
		REFERENCES "formationEtablissement"(id);

   	ALTER TABLE "indicateurPoursuite"
	DROP CONSTRAINT "indicateurPoursuite_formationEtablissement_fk",
	ADD CONSTRAINT "indicateurPoursuite_formationEtablissement_fk"
		FOREIGN KEY ("formationEtablissementId")
		REFERENCES "formationEtablissement"(id);
	`.compile(db)
  );
}
