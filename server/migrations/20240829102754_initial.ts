import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" VERSION "1.1";

CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE EXTENSION IF NOT EXISTS btree_gin VERSION "1.3";

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
	NEW."updatedAt" = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE "etablissement" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  	"uai" varchar(8) NOT NULL,
  	"libelle" varchar,
  	"statut" varchar,
	"statutDetail" varchar,
  	"url" varchar,
  	"addressStreet" varchar,
  	"addressPostCode" varchar,
  	"addressCity" varchar,
  	"addressCedex" varchar,
  	"coordinate" geometry(POINT,4326),
  	"onisepId" varchar,

	"JPODetails" text,

	"hasFormation" boolean,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "etablissement_pkey" PRIMARY KEY (id),
	CONSTRAINT "etablissement_uai_key" UNIQUE ("uai")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "etablissement"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE INDEX "etablissement_coordinate_idx" ON etablissement USING gist (coordinate);

CREATE TABLE "etablissementJPODate" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"etablissementId" uuid NOT NULL,
	"from" TIMESTAMPTZ,
	"to" TIMESTAMPTZ,
	"fullDay" boolean,
	"details" varchar,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "etablissementJPODate_pkey" PRIMARY KEY (id),
	CONSTRAINT "etablissementJPODate_etablissement_fk" FOREIGN KEY ("etablissementId") REFERENCES "etablissement"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "etablissementJPODate"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "formation" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"cfd" varchar NOT NULL,
	"voie" varchar NOT NULL,
	"codeDispositif" varchar,
	"codeDiplome" varchar,
	"mef11" varchar,
	"codeRncp" varchar,
	"libelle" varchar,
	"description" varchar,
	"onisepIdentifiant" varchar,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formation_pkey" PRIMARY KEY (id),
	CONSTRAINT "formation_cfd_voie_codeDispositif_key" UNIQUE NULLS NOT DISTINCT ("cfd", "voie", "codeDispositif")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formation"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE "domaine" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"domaine" varchar NOT NULL,
	"sousDomaine" varchar NOT NULL,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "domaine_pkey" PRIMARY KEY (id),
	CONSTRAINT "domaine_domaine_sousDomaine_key" UNIQUE ("domaine", "sousDomaine")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "domaine"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();



CREATE TABLE "formationDomaine" (
	"formationId" uuid NOT NULL,
	"domaineId" uuid NOT NULL,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationDomaine_pkey" PRIMARY KEY ("formationId", "domaineId"),
	CONSTRAINT "formationDomaine_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id),
	CONSTRAINT "formationDomaine_domaine_fk" FOREIGN KEY ("domaineId") REFERENCES "domaine"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationDomaine"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "formationEtablissement" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"etablissementId" uuid NOT NULL,
	"formationId" uuid NOT NULL,
	"duree" varchar,
	"millesime" varchar[],
	"tags" varchar[],
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationEtablissement_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "formationEtablissement_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id),
	CONSTRAINT "formationEtablissement_etablissement_fk" FOREIGN KEY ("etablissementId") REFERENCES "etablissement"(id),

	CONSTRAINT "formationEtablissement_etablissementId_formationId_key" UNIQUE NULLS NOT DISTINCT ("etablissementId", "formationId")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationEtablissement"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "indicateurEntree" (
	"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
	"formationEtablissementId" uuid,
	"rentreeScolaire" varchar,
	"capacite" integer,
	"premiersVoeux" integer,
	"effectifs" integer,
	"tauxPression" real,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "indicateurEntree_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "indicateurEntree_formationEtablissement_fk" FOREIGN KEY ("formationEtablissementId") REFERENCES "formationEtablissement"(id),
	CONSTRAINT "indicateurEntree_formationEtablissementId_rentreeScolaire_key" UNIQUE ("formationEtablissementId", "rentreeScolaire")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "indicateurEntree"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "indicateurPoursuite" (
	"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
	"formationEtablissementId" uuid,
	"millesime" varchar,
	"taux_en_emploi_6_mois" real,
	"taux_en_formation" real,
	"taux_autres_6_mois" real,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "indicateurPoursuite_pkey" PRIMARY KEY ("id"),
	CONSTRAINT "indicateurPoursuite_formationEtablissement_fk" FOREIGN KEY ("formationEtablissementId") REFERENCES "formationEtablissement"(id),
	CONSTRAINT "indicateurPoursuite_formationEtablissementId_millesime_key" UNIQUE ("formationEtablissementId", "millesime")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "indicateurPoursuite"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();


CREATE TABLE "rawData" (
	id uuid NOT NULL DEFAULT uuid_generate_v4(),
	"type" varchar NOT NULL,
	"data" jsonb NULL,
      
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "rawData_pkey" PRIMARY KEY ("id")
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "rawData"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE INDEX "rawData_data_gin" ON "rawData" USING gin (data);
CREATE INDEX "rawData_type_id_data_gin" ON "rawData" USING gin (type, id, data);
CREATE INDEX "rawdata_id_idx" ON "rawData" USING btree (id);
CREATE INDEX "rawdata_type_idx" ON "rawData" USING btree (type);


CREATE TABLE "metric" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"time" TIMESTAMPTZ NOT NULL,
	"consumer" varchar,
	"url" varchar NOT NULL,
	"uai" varchar,
	"uais" varchar[],
	"cfd" varchar,
	"cfds" varchar[],
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "metric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "metric_createdAt_idx" ON "metric" USING brin ("createdAt");
CREATE INDEX "metric_updatedAt_idx" ON "metric" USING brin ("updatedAt");


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "metric"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TABLE "log" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"data" jsonb NULL,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "log_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "log_createdAt_idx" ON "metric" USING brin ("createdAt");
CREATE INDEX "log_updatedAt_idx" ON "metric" USING brin ("updatedAt");


CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "log"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "indicateurPoursuite";
	DROP TABLE IF EXISTS "indicateurEntree";
	DROP TABLE IF EXISTS "formationEtablissement";
	DROP TABLE IF EXISTS "formationDomaine";
	DROP TABLE IF EXISTS "domaine";
	DROP TABLE IF EXISTS "formation";
	DROP TABLE IF EXISTS "etablissementJPODate";
	DROP TABLE IF EXISTS "etablissement";
	DROP TABLE IF EXISTS "rawData";
	DROP TABLE IF EXISTS "metric";
	DROP TABLE IF EXISTS "log";
	`.compile(db)
  );
}
