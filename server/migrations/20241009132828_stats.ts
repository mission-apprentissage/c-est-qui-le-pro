import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE TABLE "indicateurPoursuiteRegional" (
	"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
	"cfd" varchar NOT NULL,
	"voie" varchar NOT NULL,
	"codeDispositif" varchar,
	"region" varchar(2) NOT NULL,
	"millesime" varchar,
	"part_en_emploi_6_mois" real,
	"taux_en_emploi_6_mois" real,
	"taux_en_formation" real,
	"taux_autres_6_mois" real,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "indicateurPoursuiteRegional_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "indicateurPoursuiteRegional_cfd_voie_codeDispositif_region_millesime_key" UNIQUE NULLS NOT DISTINCT ("cfd", "voie", "codeDispositif", "region", "millesime")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "indicateurPoursuiteRegional"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


ALTER TABLE "indicateurPoursuite" 
		ADD COLUMN "part_en_emploi_6_mois" varchar;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "indicateurPoursuiteRegional";

	ALTER TABLE "indicateurPoursuite"
		DROP COLUMN IF EXISTS "part_en_emploi_6_mois";
	`.compile(db)
  );
}
