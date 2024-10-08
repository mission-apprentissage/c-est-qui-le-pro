import { oleoduc, writeData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import { RawData, RawDataType } from "#src/common/repositories/rawData";
import { kdb } from "#src/common/db/db";
import { omitNil } from "#src/common/utils/objectUtils";
import { urlOnisepToId } from "#src/services/onisep/utils";
import fs from "fs";
import { Readable } from "stream";
import { sql } from "kysely";

const logger = getLoggerWithContext("import");

async function addPoursuiteEtudes(forCode, data) {
  const poursuites = data.poursuiteList;

  const formationsWithContinuum = await kdb
    .selectFrom("formation")
    .where("onisepIdentifiant", "=", forCode)
    .select("id")
    .execute();

  if (poursuites.length == 0) {
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
    const checkFormation = await kdb
      .selectFrom("rawData")
      .selectAll()
      .where("type", "=", RawDataType.ONISEP_ideoFormationsInitiales)
      .where(
        sql.raw(`LOWER(data -> 'data' ->> 'libelle_formation_principal')`),
        "=",
        kdb.fn("lower", [sql.val(poursuite)])
      )
      .executeTakeFirst();

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

export async function importFichesFormationsTmp() {
  logger.info(`Importation des données des fiches de formations scrapper`);
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  const cleanDescription = (text) => {
    if (!text) {
      return null;
    }

    return text.replaceAll(/<p>[\s]+<\/p>/g, "").replaceAll(/^\s+|\s+$/g, "");
  };

  await oleoduc(
    Readable.from(Object.entries(JSON.parse(await fs.promises.readFile("data/fiches.json", "utf8")))),
    writeData(
      async ([forCode, data]) => {
        try {
          await addPoursuiteEtudes(forCode, data);

          const result = await kdb
            .updateTable("formation")
            .set(
              omitNil({
                description: cleanDescription(data.desc),
                descriptionAcces: cleanDescription(data.acces),
                descriptionPoursuiteEtudes: cleanDescription(data.poursuites),
              })
            )
            .where("onisepIdentifiant", "=", forCode)
            .returning("id")
            .execute();

          if (result && result.length > 0) {
            logger.info(`Formation ${forCode} mise à jour`);
            stats.updated++;
          }
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les informations de formation(s)  ${forCode}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}
