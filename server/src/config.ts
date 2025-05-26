import env from "env-var";
import path from "path";
import { getDirname } from "./common/utils/esmUtils.js";

const currentDir: string = getDirname(import.meta.url);
const dataDir = path.join(currentDir, "..", "data");
const dataVolumeDir = env.get("VOLUME_DIR").default(path.join(currentDir, "..", "data")).asString();

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
    logLevel: env.get("ACCOMPAGNATEUR_SQL_LOG_LEVEL").default("error").asArray(),
  },
  acce: {
    files: {
      // https://dep.adc.education.fr/acce/extract.php
      etablissements: path.join(dataDir, "acce_etablissements.csv"),
    },
  },
  affelnet: {
    voeuxAnneeRentree: "2024",
    files: {
      voeux: path.join(dataDir, "affelnet", "voeux_2024_diffusable.csv"),
    },
  },
  bcn: {
    files: {
      // Manually generated
      familleMetier: path.join(dataDir, "bcn", "n_famille_metier_spec_pro.csv"),
      lienMefFamilleMetier: path.join(dataDir, "bcn", "n_lien_mef_famille_metier.csv"),
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
  datagouv: {
    api: {
      baseUrl: env.get("DATAGOUV_BASE_URL").default("https://www.data.gouv.fr/api/1").asString(),
    },
    datasets: {
      certifinfo: "f2981d6f-e55c-42cd-8eba-3e891777e222",
      formacodeTransitionEcologique: "9f16f34b-0b29-4938-9ce1-561d6cb99fbf",
    },
  },
  exposition: {
    api: {
      baseUrl: env.get("EXPOSITION_API_BASE_URL").default("https://api.exposition.inserjeunes.beta.gouv.fr").asString(),
      username: env.get("EXPOSITION_API_USERNAME").required().asString(),
      password: env.get("EXPOSITION_API_PASSWORD").required().asString(),
    },
  },
  formation: {
    files: {
      formationSimilaire: path.join(dataDir, "formationSimilaire.json"),
      fuseIndex: path.join(dataVolumeDir, "fuseIndex.json"),
    },
  },
  franceTravail: {
    api: {
      baseAuthUrl: env.get("FRANCE_TRAVAIL_API_BASE_AUTH_URL").default("https://entreprise.pole-emploi.fr").asString(),
      baseUrl: env.get("FRANCE_TRAVAIL_API_BASE_URL").default("https://api.francetravail.io").asString(),
      clientId: env.get("FRANCE_TRAVAIL_API_CLIENT_ID").required().asString(),
      clientSecret: env.get("FRANCE_TRAVAIL_API_CLIENT_SECRET").required().asString(),
      scope: env.get("FRANCE_TRAVAIL_API_SCOPE").default("api_rome-metiersv1 nomenclatureRome").asString(),
    },
  },
  graphHopper: {
    api: {
      // Sandbox url for testing purpose, TODO : enlever serveur de ananda en cas de crash (utiliser pour accèlerer graphhopper)
      baseUrl: env.get("GRAPHHOPPER_BASE_URL").default("http://ananda-nono.io:8989").asString(),
      //baseUrl: env.get("GRAPHHOPPER_BASE_URL").default("http://141.94.105.71:8989").asString(),
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
      ideoMetiers: "5fa5949243f97",
    },
    files: {
      ideoFichesFormations: "https://api.opendata.onisep.fr/downloads/5fe07a9ecc960/5fe07a9ecc960.zip",
    },
  },
  orion: {
    files: {
      // https://orion-recette.inserjeunes.beta.gouv.fr/api/etablissements?order=asc&limit=1000000&withAnneeCommune=true
      exportEtablissements: path.join(dataDir, "orion", "etablissement_export_rentree_2023.csv"),
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
  typesense: {
    apiKey: env.get("TYPESENSE_API_KEY").default("password").asString(),
    host: env.get("TYPESENSE_HOST").default("127.0.0.1").asString(),
    port: env.get("TYPESENSE_PORT").default("8108").asPortNumber(),
  },
  keywords: {
    file: path.join(dataDir, "keywords_formations_cqlp.json"),
  },
};

export default config;
