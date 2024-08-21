import { logger } from "#src/common/logger.js";
import {
  object,
  objectId,
  string,
  enumOf,
  date,
  arrayOf,
  number,
} from "#src/common/db/collections/jsonSchema/jsonSchemaTypes.js";

const name = "formationEtablissement";

function indexes() {
  return [[{ uai: 1, cfd: 1, codeDispositif: 1, voie: 1 }, { unique: true }], [{ uai: 1 }], [{ cfd: 1 }]];
}

function schema() {
  return object(
    {
      _id: objectId(),
      uai: string(),
      cfd: string(),
      codeDispositif: string(),
      mef11: string(),
      voie: enumOf(["scolaire", "apprentissage"]),
      millesime: arrayOf(string()),
      duree: string(),
      tags: arrayOf(enumOf(["pour_travailler_rapidement", "pour_continuer_des_etudes", "admission_facile"])),
      indicateurEntree: object(
        {
          rentreeScolaire: string(),
          capacite: number(),
          premiersVoeux: number(),
          effectifs: number(),
          tauxPression: number(),
        },
        {}
      ),
      indicateurPoursuite: object({
        millesime: string(),
        taux_en_emploi_6_mois: number(),
        taux_en_formation: number(),
        taux_autres_6_mois: number(),
      }),
      _meta: object(
        {
          created_on: date(),
          updated_on: date(),
          date_import: date(),
        },
        { required: ["date_import"] }
      ),
    },
    {
      required: ["uai", "cfd", "voie", "millesime"],
      additionalProperties: false,
    }
  );
}

export const up = async (db) => {
  let collections = await db.listCollections().toArray();
  if (!collections.find((c) => c.name === name)) {
    await db.createCollection(name);
  }
  logger.debug(`Configuring indexes for collection ${name}...`);
  let dbCol = db.collection(name);
  await Promise.all(
    indexes().map(([index, options]) => {
      return dbCol.createIndex(index, options);
    })
  );
  logger.debug(`Configuring validation for collection ${name}...`);
  await db.command({
    collMod: name,
    validationLevel: "strict",
    validationAction: "error",
    validator: {
      $jsonSchema: schema(),
    },
  });
};

export const down = async () => {
  // We do not remove the collection to avoid deleting data by error
};
