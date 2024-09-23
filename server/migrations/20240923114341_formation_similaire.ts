import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
CREATE TABLE "formationSimilaire" (
	"formationId" uuid NOT NULL,
	"formationRelatedId" uuid NOT NULL,
	"similarityOrder" integer NOT NULL,
	
	"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  	"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT "formationSimilaire_pkey" PRIMARY KEY ("formationId", "formationRelatedId"),
	CONSTRAINT "formationSimilaire_formation_fk" FOREIGN KEY ("formationId") REFERENCES "formation"(id),
	CONSTRAINT "formationSimilaire_formationRelated_fk" FOREIGN KEY ("formationRelatedId") REFERENCES "formation"(id)
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON "formationSimilaire"
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TABLE IF EXISTS "formationSimilaire";
	`.compile(db)
  );
}
