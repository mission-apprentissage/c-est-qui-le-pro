import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`

CREATE TABLE "rome" (
	"rome" CHAR(5) NOT NULL,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "rome_pkey" PRIMARY KEY ("rome")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "rome"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "formationRome" (
	"formationId" uuid NOT NULL,
	"rome" CHAR(5) NOT NULL,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationRome_pkey" PRIMARY KEY ("formationId", "rome"),
	CONSTRAINT "formationRome_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id),
	CONSTRAINT "formationRome_rome_fk" FOREIGN KEY ("rome") REFERENCES "rome"(rome)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationRome"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "romeMetier" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"rome" CHAR(5) NOT NULL,
	"libelle" VARCHAR NOT NULL,
	"onisepLibelle" VARCHAR,
	"onisepLink" VARCHAR,
	"franceTravailLibelle" VARCHAR,
	"franceTravailLink" VARCHAR,

	"transitionEcologique" BOOLEAN NOT NULL,
	"transitionEcologiqueDetaillee" VARCHAR,
	"transitionNumerique" BOOLEAN NOT NULL,
	"transitionDemographique" BOOLEAN NOT NULL,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "romeMetier_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "romeMetier_rome_libelle_key" UNIQUE ("rome", "libelle"),
	CONSTRAINT "romeMetier_rome_fk" FOREIGN KEY ("rome") REFERENCES "rome"(rome)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "romeMetier"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "formationRome";
	DROP TABLE IF EXISTS "romeMetier";
	DROP TABLE IF EXISTS "rome";
	`.compile(db)
  );
}
