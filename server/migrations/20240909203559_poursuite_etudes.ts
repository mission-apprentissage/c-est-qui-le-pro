import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE TABLE "formationPoursuite" (
	"formationId" uuid NOT NULL,
	"libelle" VARCHAR NOT NULL,
	"onisepId" VARCHAR,
	"type" VARCHAR,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationPoursuite_pkey" PRIMARY KEY ("formationId", "libelle"),
	CONSTRAINT "formationPoursuite_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationPoursuite"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "formationPoursuite";
	`.compile(db)
  );
}
