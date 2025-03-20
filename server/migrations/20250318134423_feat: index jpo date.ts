import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	CREATE INDEX "etablissementJPODate_etablissementId_idx" ON "etablissementJPODate" ("etablissementId");
	CREATE INDEX "etablissementIsochrone_etablissementId_idx" ON "etablissementIsochrone" ("etablissementId");

	CREATE OR REPLACE VIEW "formationFamilleMetierView" AS
		select 
			"etablissementId",
			"familleMetierId",
			"millesime",
			json_agg(to_jsonb("formationsFamilleMetier") - 'id' - 'libelle' - 'etablissementId' - 'familleMetierId' - 'millesime' ORDER BY "formationsFamilleMetier".libelle) as "formationsFamilleMetier" 
		FROM (
			select 
				row_to_json("fMetier") as "formation", 
				row_to_json("feMetier") as "formationEtablissement", 
				row_to_json("eEtablissement") as "etablissement", 
				"fMetier"."libelle",
				"feMetier"."id",
				"feMetier"."etablissementId",
				"feMetier"."millesime",
				"fMetier"."familleMetierId"
			from "formationEtablissement" as "feMetier" 
			inner join "formation" as "fMetier" on "feMetier"."formationId" = "fMetier"."id" 
			inner join "etablissement" as "eEtablissement" on "feMetier"."etablissementId" = "eEtablissement"."id" 
			where "fMetier"."isAnneeCommune" = false
			order by "fMetier"."libelle") as "formationsFamilleMetier"
		GROUP BY "etablissementId", "familleMetierId", "millesime";

	CREATE MATERIALIZED VIEW "formationFamilleMetierMView" AS
		select 
			"etablissementId",
			"familleMetierId",
			"millesime",
			json_agg(to_jsonb("formationsFamilleMetier") - 'id' - 'libelle' - 'etablissementId' - 'familleMetierId' - 'millesime' ORDER BY "formationsFamilleMetier".libelle) as "formationsFamilleMetier" 
		FROM (
			select 
				row_to_json("fMetier") as "formation", 
				row_to_json("feMetier") as "formationEtablissement", 
				row_to_json("eEtablissement") as "etablissement", 
				"fMetier"."libelle",
				"feMetier"."id",
				"feMetier"."etablissementId",
				"feMetier"."millesime",
				"fMetier"."familleMetierId"
			from "formationEtablissement" as "feMetier" 
			inner join "formation" as "fMetier" on "feMetier"."formationId" = "fMetier"."id" 
			inner join "etablissement" as "eEtablissement" on "feMetier"."etablissementId" = "eEtablissement"."id" 
			where "fMetier"."isAnneeCommune" = false
			order by "fMetier"."libelle") as "formationsFamilleMetier"
		GROUP BY "etablissementId", "familleMetierId", "millesime";


	CREATE UNIQUE INDEX "formationFamilleMetierMView_etablissementId_familleMetierId_key" 
		ON "formationFamilleMetierMView" ("etablissementId", "familleMetierId");

	CREATE INDEX "formationFamilleMetierMView_millesime_etablissementId_familleMetierId_idx" ON "formationFamilleMetierMView" 
		USING GIN (millesime, "etablissementId", "familleMetierId");

	/* Trigger to refresh the view */
	CREATE OR REPLACE FUNCTION refresh_materialized_view()
		RETURNS TRIGGER AS $$
		BEGIN
			PERFORM pg_background_launch('REFRESH MATERIALIZED VIEW CONCURRENTLY "formationFamilleMetierMView"');
			RETURN NULL;
		END;
		$$ LANGUAGE plpgsql;

	CREATE OR REPLACE TRIGGER refresh_materialized_view_trigger
		AFTER INSERT OR UPDATE OR DELETE
		ON "formation"
		FOR EACH STATEMENT
		EXECUTE FUNCTION refresh_materialized_view();

	CREATE OR REPLACE TRIGGER refresh_materialized_view_trigger
		AFTER INSERT OR UPDATE OR DELETE
		ON "formationEtablissement"
		FOR EACH STATEMENT
		EXECUTE FUNCTION refresh_materialized_view();

	CREATE OR REPLACE TRIGGER refresh_materialized_view_trigger
		AFTER INSERT OR UPDATE OR DELETE
		ON "etablissement"
		FOR EACH STATEMENT
		EXECUTE FUNCTION refresh_materialized_view();

`.compile(db)
  );
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.executeQuery(
    sql`
	DROP INDEX "etablissementJPODate_etablissementId_idx";
	DROP INDEX "etablissementIsochrone_etablissementId_idx";

	DROP INDEX "formationFamilleMetierMView_etablissementId_familleMetierId_key";
	DROP INDEX "formationFamilleMetierMView_millesime_etablissementId_familleMetierId_idx";

	DROP VIEW "formationFamilleMetierView";
	DROP MATERIALIZED VIEW "formationFamilleMetierMView";
	`.compile(db)
  );
}
