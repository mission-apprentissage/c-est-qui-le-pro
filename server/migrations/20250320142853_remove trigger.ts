import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "formation";

	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "formationEtablissement";

	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "etablissement";

	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "formationDomaine";

	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "domaine";

	DROP TRIGGER IF EXISTS refresh_materialized_view_trigger ON "etablissementJPODate";

	DROP FUNCTION IF EXISTS refresh_materialized_view;
`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	`.compile(db)
  );
}
