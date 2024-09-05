import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`

CREATE TABLE "etablissementIsochrone" (
	"id" uuid NOT NULL DEFAULT uuid_generate_v4(),
	"etablissementId" uuid NOT NULL,
  	"bucket" integer NOT NULL,
  	"geom" geometry(GEOMETRY, 4326) NOT NULL,
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "etablissementIsochrone_pkey" PRIMARY KEY (id),
	CONSTRAINT "etablissementIsochrone_etablissement_fk" FOREIGN KEY ("etablissementId") REFERENCES "etablissement"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "etablissementIsochrone"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE INDEX "etablissementIsochrone_geom_idx" ON "etablissementIsochrone" USING gist (geom);
CREATE INDEX "etablissementIsochrone_bucket_idx" ON "etablissementIsochrone" USING btree (bucket);

`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "etablissementIsochrone";
	`.compile(db)
  );
}
