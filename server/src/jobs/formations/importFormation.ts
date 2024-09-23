import { filterData, oleoduc, writeData } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger";
import { omitNil } from "#src/common/utils/objectUtils.js";
import { streamCertifInfo } from "#src/services/dataGouv/certifinfo.js";
import FormationRepository from "#src/common/repositories/formation";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { kdb, upsert } from "#src/common/db/db";
import { isNil } from "lodash-es";

const logger = getLoggerWithContext("import");

function formatDomaine(formationInitiale) {
  if (!formationInitiale || !formationInitiale["domainesous-domaine"]) {
    return [];
  }

  const domaines = formationInitiale["domainesous-domaine"].split(" | ");
  return domaines.map((domaine) => {
    const domainePart = domaine.split("/");
    return {
      domaine: domainePart[0],
      sousDomaine: domainePart[1],
    };
  });
}

async function getFormationInitialeWithContinuum(bcn) {
  const { code_formation_diplome } = bcn;

  const formationInitiale = await RawDataRepository.firstForType(RawDataType.ONISEP_ideoFormationsInitiales, {
    data: { code_scolarite: code_formation_diplome },
  });

  if (formationInitiale) {
    return formationInitiale.data as RawData[RawDataType.ONISEP_ideoFormationsInitiales];
  }

  const bcnCfdResult = await RawDataRepository.firstForType(RawDataType.BCN, {
    code_certification: code_formation_diplome,
  });
  const bcnCfd = bcnCfdResult?.data as RawData[RawDataType.BCN];

  if (!bcnCfd || !bcnCfd.nouveau_diplome || bcnCfd.nouveau_diplome.length !== 1) {
    return null;
  }

  const formationInitialeNew = await RawDataRepository.firstForType(RawDataType.ONISEP_ideoFormationsInitiales, {
    data: { code_scolarite: bcnCfd.nouveau_diplome[0] },
  });

  return formationInitialeNew
    ? (formationInitialeNew.data as RawData[RawDataType.ONISEP_ideoFormationsInitiales])
    : null;
}

async function importFromBcnAndOnisep() {
  const stats = { total: 0, created: 0, failed: 0 };

  await oleoduc(
    await RawDataRepository.search(RawDataType.BCN),
    filterData(({ data }) => {
      return !isNil(data?.diplome?.code) ? ["3", "4"].includes(data.diplome.code) : false;
    }),
    // Keep only last year mef when type is mef
    filterData(async ({ data }) => {
      const { type, code_certification } = data;
      if (type !== "mef") {
        return true;
      }

      const bcnMef = (
        await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
          mef_stat_11: code_certification,
        })
      )?.data as RawData[RawDataType.BCN_MEF];

      // Keep mef not foud
      if (!bcnMef) {
        return true;
      }

      const bcnMefLastYear = (
        await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
          formation_diplome: bcnMef.formation_diplome,
          dispositif_formation: bcnMef.dispositif_formation,
          annee_dispositif: bcnMef.duree_dispositif,
        })
      )?.data as RawData[RawDataType.BCN_MEF];

      // Keep last year mef not foud
      if (!bcnMefLastYear) {
        return true;
      }

      return bcnMefLastYear.mef_stat_11 == code_certification;
    }),
    writeData(
      async ({ data: bcn }) => {
        const { code_formation_diplome, type, code_certification, libelle_long } = bcn;

        const bcnMef =
          type === "mef"
            ? ((
                await RawDataRepository.firstForType(RawDataType.BCN_MEF, {
                  mef_stat_11: code_certification,
                })
              )?.data as RawData[RawDataType.BCN_MEF])
            : null;

        const formationInitiale = await getFormationInitialeWithContinuum(bcn);
        const dataFormatted = {
          cfd: code_formation_diplome,
          voie: type === "mef" ? "scolaire" : "apprentissage",
          codeDispositif: bcnMef ? bcnMef.dispositif_formation : null,
          codeDiplome: bcn.diplome.code,
          mef11: bcnMef ? code_certification : null,
          libelle: formationInitiale ? formationInitiale.data.libelle_formation_principal : libelle_long,
          codeRncp: formationInitiale ? formationInitiale.data.code_rncp : null,
        };
        const domaines = formatDomaine(formationInitiale?.data);

        try {
          const queryData = omitNil({
            ...dataFormatted,
          });

          const result = await FormationRepository.upsert(["cfd", "voie", "codeDispositif"], queryData, queryData, [
            "id",
          ]);

          if (domaines) {
            for (const domaine of domaines) {
              // TODO: do not upsert on domaine
              const domaineResult = await upsert(kdb, "domaine", ["domaine", "sousDomaine"], domaine, domaine, ["id"]);
              await upsert(kdb, "formationDomaine", ["formationId", "domaineId"], {
                formationId: result.id,
                domaineId: domaineResult.id,
              });
            }
          }

          logger.info(`Formation ${dataFormatted.cfd} ajoutée ou mise à jour`);
          stats.created++;
        } catch (e) {
          logger.error(e, `Impossible d'ajouter les données de la formation ${dataFormatted.cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

async function importFromCertifInfo() {
  const stats = { total: 0, created: 0, updated: 0, failed: 0 };

  await oleoduc(
    // TODO: check format return by certif info
    await streamCertifInfo(),
    filterData((data) => {
      return !!data["Code_Scolarité"];
    }),
    writeData(
      async (data) => {
        const libelle = data["Libelle_Diplome"];
        const cfd = data["Code_Scolarité"];

        try {
          const result = await FormationRepository.updateBy(
            {
              libelle,
            },
            { cfd: cfd }
          );

          if (result && result.length > 0) {
            logger.info(`Formation ${cfd} mise à jour`);
            stats.updated++;
          }
        } catch (e) {
          logger.error(e, `Impossible de mettre à jour les données de la formation ${cfd}`);
          stats.failed++;
        }
      },
      { parallel: 1 }
    )
  );

  return stats;
}

export async function importFormation() {
  logger.info(`Importation des formations`);

  const statsBcnOnisep = await importFromBcnAndOnisep();
  const statsCertifInfo = await importFromCertifInfo();

  return {
    statsBcnOnisep,
    statsCertifInfo,
  };
}
