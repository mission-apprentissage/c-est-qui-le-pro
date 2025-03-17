import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE TABLE "indicateurPoursuiteNational" (
	"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
	"cfd" varchar NOT NULL,
	"voie" varchar NOT NULL,
	"codeDispositif" varchar,
	"millesime" varchar,
	"part_en_emploi_6_mois" real,
	"taux_en_emploi_6_mois" real,
	"taux_en_formation" real,
	"taux_autres_6_mois" real,
	"salaire_12_mois_q1" integer,
	"salaire_12_mois_q2" integer,
	"salaire_12_mois_q3" integer,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "indicateurPoursuiteNational_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "indicateurPoursuiteNational_cfd_voie_codeDispositif_millesime_key" UNIQUE NULLS NOT DISTINCT ("cfd", "voie", "codeDispositif", "millesime")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "indicateurPoursuiteNational"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "indicateurPoursuiteNational";
	`.compile(db)
  );
}
