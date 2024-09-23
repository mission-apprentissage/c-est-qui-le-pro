import { oleoduc, writeData, filterData, transformData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { streamIdeoFichesFormations } from "#src/services/onisep/fichesFormations.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { kdb } from "#src/common/db/db";
import { omitNil } from "#src/common/utils/objectUtils";
import { urlOnisepToId } from "#src/services/onisep/utils";

const logger = getLoggerWithContext("import");

async function cfdsParentAndChildren(cfd) {
  const cfds = [cfd];

  const diplomeBCNBase = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: cfd }))
    ?.data as RawData[RawDataType.BCN];
  if (!diplomeBCNBase) {
    return cfds;
  }

  let diplomeBCN = diplomeBCNBase;
  let parents = diplomeBCN.ancien_diplome;
  // Support only 1 to 1 case
  while (parents && parents.length == 1) {
    cfds.push(parents[0]);
    diplomeBCN = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: parents[0] }))
      ?.data as RawData[RawDataType.BCN];

    parents = diplomeBCN?.ancien_diplome;
  }

  diplomeBCN = diplomeBCNBase;
  let children = diplomeBCN.nouveau_diplome;
  // Support only 1 to 1 case
  while (children && children.length == 1) {
    cfds.push(children[0]);
    diplomeBCN = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: children[0] }))
      ?.data as RawData[RawDataType.BCN];

    children = diplomeBCN?.nouveau_diplome;
  }

  return cfds;
}

async function addPoursuiteEtudes(cfds, formation) {
  const poursuitesRaw = formation?.poursuites_etudes?.poursuite_etudes?.formation_poursuite_Etudes || [];
  const poursuites = Array.isArray(poursuitesRaw) ? poursuitesRaw : [poursuitesRaw];
  const formationsWithContinuum = await kdb.selectFrom("formation").where("cfd", "in", cfds).select("id").execute();

  if (formationsWithContinuum.length == 0) {
    return;
  }

  await kdb
    .deleteFrom("formationPoursuite")
    .where(
      "formationId",
      "in",
      formationsWithContinuum.map(({ id }) => id)
    )
    .returning("formationId")
    .execute();

  for (const poursuite of poursuites) {
    const checkFormation = await RawDataRepository.firstForType(RawDataType.ONISEP_ideoFormationsInitiales, {
      data: { libelle_formation_principal: poursuite },
    });

    const dataFormation = checkFormation.data as RawData[RawDataType.ONISEP_ideoFormationsInitiales];

    if (!checkFormation) {
      logger.error(`La formation de poursuite d'étude "${poursuite}" n'existe pas`);
    } else {
      for (const formationWithContinuum of formationsWithContinuum) {
        await kdb
          .insertInto("formationPoursuite")
          .values({
            formationId: formationWithContinuum.id,
            libelle: dataFormation.data.libelle_formation_principal,
            onisepId: urlOnisepToId(dataFormation.data.url_et_id_onisep),
            type: dataFormation.data.libelle_type_formation,
          })
          .executeTakeFirst();
      }
    }
  }
}
export async function importIdeoFichesFormations() {
  logger.info(`Importation des données des fiches de formations Idéo`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const cleanDescription = (text) => {
    if (!text) {
      return null;
    }

    return text.replaceAll(/<p>[\s]+<\/p>/g, "").replaceAll(/^\s+|\s+$/g, "");
  };

  await oleoduc(
    await streamIdeoFichesFormations(),
    filterData((data) => data.code_scolarite),
    transformData(async (formation) => {
      const cfds = await cfdsParentAndChildren(formation.code_scolarite);
      return { cfds, formation };
    }),
    writeData(
      async ({ cfds, formation }) => {
        try {
          await addPoursuiteEtudes(cfds, formation);

          const result = await kdb
            .updateTable("formation")
            .set(
              omitNil({
                description: cleanDescription(formation.descriptif_format_court),
                descriptionAcces: cleanDescription(formation.descriptif_acces),
                descriptionPoursuiteEtudes: cleanDescription(formation.descriptif_poursuite_etudes),
                onisepIdentifiant: formation.identifiant,
              })
            )
            .where("cfd", "in", cfds)
            .returning("id")
            .execute();

          if (result && result.length > 0) {
            logger.info(`Formation(s) ${cfds.join(",")} mise(s) à jour`);
            stats.updated += cfds.length;
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les informations de formation(s) ${cfds.join(",")}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
