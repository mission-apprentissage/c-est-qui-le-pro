import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE TABLE "familleMetier" (
		"id" uuid  NOT NULL DEFAULT uuid_generate_v4(),
		"code" varchar NOT NULL,
		"libelle" varchar NOT NULL,

		"createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
		"updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),

		CONSTRAINT "familleMetier_pkey" PRIMARY KEY ("id"),
		CONSTRAINT "familleMetier_code_key" UNIQUE ("code")
	);

	CREATE TRIGGER set_timestamp
	BEFORE UPDATE ON "familleMetier"
	FOR EACH ROW
	EXECUTE PROCEDURE trigger_set_timestamp();

	ALTER TABLE "formation" 
		ADD COLUMN "familleMetierId" uuid,
		ADD COLUMN "isAnneeCommune" boolean DEFAULT false,
		ADD CONSTRAINT "formation_familleMetier_fk" FOREIGN KEY ("familleMetierId") REFERENCES "familleMetier"(id);
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	ALTER TABLE "formation"
		DROP COLUMN IF EXISTS "familleMetierId",
		DROP COLUMN IF EXISTS "isAnneeCommune";

	DROP TABLE IF EXISTS "familleMetier";
	`.compile(db)
  );
}
