import env from "env-var";
import path from "path";
import { getDirname } from "./common/utils/esmUtils.js";

const config = {
  env: env.get("ACCOMPAGNATEUR_ENV").default("local").asString(),
  publicUrl: env.get("ACCOMPAGNATEUR_PUBLIC_URL").default("http://localhost").asString(),
  log: {
    level: env.get("ACCOMPAGNATEUR_LOG_LEVEL").default("info").asString(),
    format: env.get("ACCOMPAGNATEUR_LOG_FORMAT").default("pretty").asString(),
    destinations: env.get("ACCOMPAGNATEUR_LOG_DESTINATIONS").default("stdout").asArray(),
  },
  slackWebhookUrl: env.get("ACCOMPAGNATEUR_SLACK_WEBHOOK_URL").asString(),
  features: {
    graphhopper: {
      // Use static date for now
      useStaticDate: true,
    },
  },
  pgsql: {
    uri: env
      .get("ACCOMPAGNATEUR_POSTGRES_URI")
      .default("postgres://postgres:password@127.0.0.1:5432/postgres")
      .asString(),
    ca: env.get("ACCOMPAGNATEUR_POSTGRES_CA").asString(),
  },
  sql: {
    logLevel: env.get("ACCOMPAGNATEUR_SQL_LOG_LEVEL").asArray(),
  },
  graphHopper: {
    api: {
      // Sandbox url for testing purpose, TODO : enlever serveur de ananda en cas de crash (utiliser pour accèlerer graphhopper)
      baseUrl: env.get("GRAPHHOPPER_BASE_URL").default("http://ananda-nono.io:8989").asString(),
      //baseUrl: env.get("GRAPHHOPPER_BASE_URL").default("http://141.94.105.71:8989").asString(),
    },
  },
  exposition: {
    api: {
      baseUrl: env.get("EXPOSITION_API_BASE_URL").default("https://api.exposition.inserjeunes.beta.gouv.fr").asString(),
      username: env.get("EXPOSITION_API_USERNAME").required().asString(),
      password: env.get("EXPOSITION_API_PASSWORD").required().asString(),
    },
  },
  datagouv: {
    api: {
      baseUrl: env.get("DATAGOUV_BASE_URL").default("https://www.data.gouv.fr/api/1").asString(),
    },
    datasets: {
      certifinfo: "f2981d6f-e55c-42cd-8eba-3e891777e222",
    },
  },
  onisep: {
    api: {
      baseUrl: env.get("ONISEP_BASE_URL").default("https://api.opendata.onisep.fr/api/1.0").asString(),
    },
    datasets: {
      tablePassageCodesCertifications: "6152ccdf850ef",
      ideoActionsFormationInitialeUniversLycee: "605340ddc19a9",
      ideoStructuresEnseignementSecondaire: "5fa5816ac6a6e",
      ideoFormationsInitiales: "5fa591127f501",
    },
    files: {
      ideoFichesFormations: "https://api.opendata.onisep.fr/downloads/5fe07a9ecc960/5fe07a9ecc960.zip",
    },
  },
  catalogueApprentissage: {
    api: {
      baseUrl: env
        .get("CATALOGUE_APPRENTISSAGE_BASE_URL")
        .default("https://catalogue.apprentissage.education.gouv.fr/api/v1")
        .asString(),
      username: env.get("CATALOGUE_APPRENTISSAGE_USERNAME").required().asString(),
      password: env.get("CATALOGUE_APPRENTISSAGE_PASSWORD").required().asString(),
    },
  },
  acce: {
    files: {
      // https://dep.adc.education.fr/acce/extract.php
      etablissements: path.join(getDirname(import.meta.url), "../data/", "acce_etablissements.csv"),
    },
  },
  orion: {
    files: {
      // https://orion-recette.inserjeunes.beta.gouv.fr/api/etablissements?order=asc&limit=1000000&withAnneeCommune=true
      exportEtablissements: path.join(
        getDirname(import.meta.url),
        "../data/orion/",
        "etablissement_export_rentree_2023.csv"
      ),
    },
  },
  rome: {
    files: {
      // https://www.data.gouv.fr/fr/datasets/repertoire-operationnel-des-metiers-et-des-emplois-rome/
      rome: path.join(getDirname(import.meta.url), "..", "data", "rome", "rome.csv"),
      // Manually generated
      romeMetier: path.join(getDirname(import.meta.url), "..", "data", "rome", "romeMetier.csv"),
    },
  },
  rco: {
    bucket: {
      endpoint: env.get("RCO_BUCKET_ENDPOINT").required().asString(),
      region: env.get("RCO_BUCKET_REGION").required().asString(),
      accessKey: env.get("RCO_BUCKET_ACCESS_KEY").required().asString(),
      secretKey: env.get("RCO_BUCKET_SECRET_KEY").required().asString(),
      name: env.get("RCO_BUCKET_NAME").required().asString(),
    },
    file: {
      certifInfo: "inserJeune-certifinfo.csv",
      certificationRome: "inserJeune-certification-rome.csv",
    },
  },
  formation: {
    files: {
      formationSimilaire: path.join(getDirname(import.meta.url), "..", "data", "formationSimilaire.json"),
    },
  },
};

export default config;
