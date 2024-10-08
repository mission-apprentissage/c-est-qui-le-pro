import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE INDEX "formationEtablissement_etablissementId_idx" ON "formationEtablissement" ("etablissementId");
	CREATE INDEX "formationEtablissement_formationId_idx" ON "formationEtablissement" ("formationId");
	CREATE INDEX "formationEtablissement_millesime_idx" ON "formationEtablissement" USING gin("millesime");

	CREATE INDEX "etablissement_academie_idx" ON "etablissement" ("academie");
	CREATE INDEX "etablissement_hasFormation_idx" ON "etablissement" ("hasFormation");
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP INDEX "formationEtablissement_etablissementId_idx";
	DROP INDEX "formationEtablissement_formationId_idx";
	DROP INDEX "formationEtablissement_millesime_idx";

	DROP INDEX "etablissement_academie_idx";
	DROP INDEX "etablissement_hasFormation_idx";
	`.compile(db)
  );
}
