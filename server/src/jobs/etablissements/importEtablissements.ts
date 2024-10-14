import { oleoduc, writeData, transformData, filterData } from "oleoduc";
import transformation from "transform-coordinates";
import { getLoggerWithContext } from "#src/common/logger.js";
import { omitNil } from "#src/common/utils/objectUtils.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { parseJourneesPortesOuvertes } from "#src/services/onisep/etablissement.js";
import { get } from "lodash-es";
import { kdb, kyselyChainFn, upsert } from "#src/common/db/db";
import { sql } from "kysely";
import { formatUrl } from "#src/common/utils/formatUtils.js";
import { RegionsService } from "shared";

const logger = getLoggerWithContext("import");

function formatStatutEtablissement(statut) {
  if (!statut) {
    return { statut: null, statutDetail: null };
  }

  switch (statut.toLowerCase()) {
    case "privé":
      return { statut: "privé", statutDetail: null };
    case "public":
      return { statut: "public", statutDetail: null };
    case "privé hors contrat":
      return { statut: "privé", statutDetail: "hors contrat" };
    case "privé reconnu par l'etat":
      return { statut: "privé", statutDetail: "reconnu par l'Etat" };
    case "privé sous contrat":
      return { statut: "privé", statutDetail: "sous contrat" };
    default:
      logger.error(`Statut d'établissement "${statut}" inconnu`);
      return { statut: null, statutDetail: null };
  }
}

export async function importEtablissements() {
  logger.info(`Importation des établissements`);
  const stats = { total: 0, created: 0, failed: 0 };

  const transform = transformation("EPSG:2154", "EPSG:4326");

  await oleoduc(
    await RawDataRepository.search(RawDataType.ACCE),
    filterData((data) => {
      // Filtre les établissement qui nous intéressent (lycée, CFA ...)
      return data.data.nature_uai.match(/^[2345678]/) && data.data.pays_libe.toLowerCase() === "france";
    }),
    transformData(({ data }) => {
      try {
        return {
          data,
          // TODO: validate data
          formated: {
            uai: data.numero_uai,
            libelle: data.appellation_officielle,
            url: formatUrl(data.site_web),
            ...formatStatutEtablissement(data.secteur_public_prive_libe),
            addressStreet: data.adresse_uai,
            addressPostCode: data.commune,
            addressCity: data.commune_libe,
            addressCedex: /cedex/i.test(data.localite_acheminement_uai),
            academie: data.academie,
            region: data.commune ? RegionsService.findRegionByCodePostal(data.commune)?.code : null,
          },
        };
      } catch (err) {
        logger.error(err);
        stats.failed++;
        return null;
      }
    }),
    filterData((data) => data),
    // Ajout des données de l'onisep
    transformData(
      async ({ data, formated }) => {
        const onisepEtab = await RawDataRepository.firstForType(
          RawDataType.ONISEP_ideoStructuresEnseignementSecondaire,
          {
            data: { code_uai: formated.uai },
          }
        );

        const onisepFormated = {};
        let jPO = null;

        if (onisepEtab) {
          const onisepEtabData = onisepEtab.data as RawData[RawDataType.ONISEP_ideoStructuresEnseignementSecondaire];

          const statusEtab = formatStatutEtablissement(onisepEtabData.data.statut);
          onisepFormated["statut"] = statusEtab.statut;
          onisepFormated["statutDetail"] = statusEtab.statutDetail;

          const idOnisep = onisepEtabData.data.url_et_id_onisep
            ? get(onisepEtabData.data.url_et_id_onisep.match(/ENS\.[0-9]+/), "0", null)
            : null;
          onisepFormated["onisepId"] = idOnisep;

          // Utilisation du libelle onisep de préférence
          if (onisepEtabData.data.nom) {
            onisepFormated["libelle"] = onisepEtabData.data.nom;
          }

          if (!formated.url) {
            onisepFormated["url"] = `https://www.onisep.fr/http/redirection/etablissement/slug/${idOnisep}`;
          }
          jPO = parseJourneesPortesOuvertes(onisepEtabData.data.journees_portes_ouvertes);

          // Some data are only available on ideo formation (TODO: demander à l'Onisep d'ajouter ces data dans l'idéo structure)
          const onisepFormation = await RawDataRepository.firstForType(
            RawDataType.ONISEP_ideoActionsFormationInitialeUniversLycee,
            {
              data: { ens_code_uai: formated.uai },
            }
          );

          if (onisepFormation) {
            const onisepFormationData =
              onisepFormation.data as RawData[RawDataType.ONISEP_ideoActionsFormationInitialeUniversLycee];
            onisepFormated["url"] = onisepFormationData.data.ens_site_web;
          }
        }

        return {
          data,
          formated: { ...formated, ...onisepFormated },
          jPO,
        };
      },
      { parallel: 1 }
    ),
    // Transform coordinate
    transformData(({ data, formated, jPO }) => {
      const coordinate =
        data.coordonnee_x && data.coordonnee_y
          ? transform.forward({ x: parseFloat(data.coordonnee_x), y: parseFloat(data.coordonnee_y) })
          : null;

      return {
        data,
        formated,
        jPO,
        //WGS84
        coordinate: coordinate
          ? [
              coordinate.x, //longitude
              coordinate.y, //latitude
            ]
          : null,
      };
    }),
    writeData(
      async ({ data, formated, coordinate, jPO }) => {
        stats.total++;
        try {
          const queryData = (eb) =>
            omitNil({
              ...formated,
              coordinate: coordinate
                ? kyselyChainFn(eb, [
                    { fn: "ST_Point", args: [sql`${coordinate[0]}`, sql`${coordinate[1]}`] },
                    { fn: "ST_SetSRID", args: [sql`4326`] },
                  ])
                : null,
              JPOdetails: jPO ? jPO.details : null,
            });

          const result = await upsert(kdb, "etablissement", ["uai"], queryData, queryData, ["id"]);
          // Remove old JPO
          await kdb.deleteFrom("etablissementJPODate").where("etablissementId", "=", result.id).executeTakeFirst();

          if (jPO && jPO.dates) {
            for (const date of jPO.dates) {
              await kdb
                .insertInto("etablissementJPODate")
                .values({ etablissementId: result.id, ...date })
                .returning(["id"])
                .executeTakeFirst();
            }
          }

          logger.info(`Etablissement ${formated.uai} ajouté ou mis à jour`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
