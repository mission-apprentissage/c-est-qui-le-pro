import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`

	CREATE TABLE "indicateurPoursuiteAnneeCommune" (
		"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
		"formationEtablissementId" uuid NOT NULL,
		"codeCertification" varchar NOT NULL,
		"millesime" varchar NOT NULL,
		"part_en_emploi_6_mois" real,
		"taux_en_emploi_6_mois" real,
		"taux_en_formation" real,
		"taux_autres_6_mois" real,
		"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

		CONSTRAINT "indicateurPoursuiteAnneeCommune_pkey" PRIMARY KEY ("id"),
		CONSTRAINT "indicateurPoursuiteAnneeCommune_formationEtablissement_fk" FOREIGN KEY ("formationEtablissementId") REFERENCES "formationEtablissement"(id) ON DELETE CASCADE,
		CONSTRAINT "indicateurPoursuiteAnneeCommune_formationEtablissementId_millesime_key" UNIQUE ("formationEtablissementId", "codeCertification", "millesime")
	);

	CREATE TRIGGER set_timestamp
	BEFORE UPDATE ON "indicateurPoursuiteAnneeCommune"
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_set_timestamp();

	ALTER TABLE "indicateurPoursuite" ALTER COLUMN "part_en_emploi_6_mois" TYPE real USING "part_en_emploi_6_mois"::text::real;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
		DROP TABLE IF EXISTS "indicateurPoursuiteAnneeCommune";

		ALTER TABLE "indicateurPoursuite" ALTER COLUMN "part_en_emploi_6_mois" TYPE varchar USING "part_en_emploi_6_mois";
	`.compile(db)
  );
}
