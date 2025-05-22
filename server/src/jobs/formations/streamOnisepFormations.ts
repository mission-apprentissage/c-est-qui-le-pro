import { transformData, compose, filterData, transformIntoStream } from "oleoduc";
import { getLoggerWithContext } from "#src/common/logger.js";
import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";
import { urlOnisepToId } from "#src/services/onisep/utils";
import { formatDuree } from "./importFormationEtablissement.js";
import { Readable } from "stream";

const logger = getLoggerWithContext("import");

async function getCfd(idOnisep, urlOnisep) {
  const formationInitiale = await RawDataRepository.firstForType(RawDataType.ONISEP_ideoFormationsInitiales, {
    data: { url_et_id_onisep: urlOnisep },
  });

  if (!formationInitiale) {
    logger.error(`Pas de correspondance pour l'id de formation ${idOnisep}`);
    return null;
  }

  const formationInitialeData = formationInitiale.data as RawData[RawDataType.ONISEP_ideoFormationsInitiales];
  if (!formationInitialeData.data?.code_scolarite) {
    logger.error(`Pas de CFD pour l'id de formation ${idOnisep}`);
    return null;
  }

  // TODO : ajout de la table de passage des CARIF OREF

  return formationInitialeData.data.code_scolarite;
}

function getDuree(data) {
  const DUREES = {
    "1 an": "1",
    "2 ans": "2",
    "3 ans": "3",
    "4 ans": "4",
  };

  const duree = DUREES[data?.af_duree_cycle_standard];
  if (!duree) {
    return null;
  }

  return duree;
}

async function getBcn(cfd, duree) {
  const bcn = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: cfd }))?.data;
  const bcnMef = (await RawDataRepository.search(RawDataType.BCN_MEF, { formation_diplome: cfd }, false)).map(
    ({ data }) => data
  );

  if (!bcn && !bcnMef) {
    logger.error(`Formation ${cfd} inconnu dans la BCN`);
    return {};
  }

  if (bcnMef.length > 1) {
    // If there is many results, only keep the corresponding duration
    let bcnMefFiltered = bcnMef.filter((data) => data.duree_dispositif === duree && data.annee_dispositif === duree);

    // QUICK FIX : changement des durées des familles de métiers sur l'Onisep
    if (bcnMefFiltered.length === 0) {
      bcnMefFiltered = bcnMef.filter((data) => {
        return data.duree_dispositif === data.annee_dispositif;
      });
    }

    if (bcnMefFiltered.length > 1) {
      logger.error(`Plusieurs MEF corespondent à la formation cfd : ${cfd}, durée : ${duree} ans`);
      return {};
    }

    return { bcn, bcnMef: bcnMefFiltered };
  }

  return { bcn, bcnMef };
}

export async function streamOnisepFormations({ stats }) {
  const FOR_TYPES = [
    "CAP",
    "CAP agricole",
    "baccalauréat professionnel",
    "brevet de technicien",
    "brevet professionnel agricole",
    "brevet professionnel de la jeunesse, de l'éducation populaire et du sport",
    "certificat technique des métiers",
    "classe de 2de professionnelle",
    "diplôme professionnel de l'animation et du sport",
  ];

  return compose(
    Readable.from(FOR_TYPES),
    transformIntoStream(async (FOR_TYPE) => {
      return await RawDataRepository.search(RawDataType.ONISEP_ideoActionsFormationInitialeUniversLycee, {
        data: { for_type: FOR_TYPE },
      });
    }),

    transformData(async ({ data }) => {
      stats.total++;

      const urlOnisep = data.data.for_url_et_id_onisep;
      const idOnisep = urlOnisepToId(urlOnisep);

      const cfd = await getCfd(idOnisep, urlOnisep);
      if (!cfd) {
        stats.failed++;
        return null;
      }

      const duree = getDuree(data.data);
      if (!duree) {
        stats.failed++;
        logger.error(
          `Durée de formation (${data.data.action_de_formation_af_identifiant_onisep}/${idOnisep}) invalide ${data.data.af_duree_cycle_standard}`
        );
        return null;
      }

      const { bcn, bcnMef } = await getBcn(cfd, duree);
      if (!bcn) {
        stats.failed++;
        return null;
      }

      if (!data.data.ens_code_uai) {
        logger.error(`Pas d'uai pour la formation ${data.data.action_de_formation_af_identifiant_onisep}`);
        return null;
      }

      const dataFormatted = {
        millesime: [data.millesime],
        duree: formatDuree(duree),
      };

      return {
        query: {
          uai: data.data.ens_code_uai.toUpperCase(),
          voie: "scolaire",
          cfd: cfd,
          codeDispositif: bcnMef && bcnMef[0] ? bcnMef[0].dispositif_formation : null,
        },
        data: dataFormatted,
      };
    }),
    filterData((data) => data)
  );
}
