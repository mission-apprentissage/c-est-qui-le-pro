import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE TABLE "formationKeyword" (
	"formationId" uuid NOT NULL,
	"keyword" varchar NOT NULL,
	"weight" real NOT NULL DEFAULT 1,

	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationKeyword_pkey" PRIMARY KEY ("formationId", "keyword"),
	CONSTRAINT "formationKeyword_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationKeyword"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

ALTER TABLE "formation" 
		ADD COLUMN "sigle" varchar;

`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "formationKeyword";

	ALTER TABLE "formation"
		DROP COLUMN IF EXISTS "sigle";
	`.compile(db)
  );
}
