import "dotenv/config";
import { Command } from "commander";
import { runScript, runJobs } from "./common/runScript";
import { importBCN } from "./jobs/bcn/importBCN";
import { importBCNMEF } from "./jobs/bcn/importBCNMEF";
import { importBCNContinuum } from "./jobs/bcn/importBCNContinuum";
import { computeBCNMEFContinuum } from "./jobs/bcn/computeBCNMEFContinuum";
import { importLibelle } from "./jobs/bcn/importLibelle";
import { importACCEEtablissements } from "./jobs/etablissements/importACCEEtablissements";
import { importEtablissements } from "./jobs/etablissements/importEtablissements";
import { importEtablissementJPOScrapTmp } from "./jobs/etablissements/importEtablissementJPOScrapTmp";
import { importFormation } from "./jobs/formations/importFormation";
import { importFormations as importCAFormations } from "./jobs/catalogueApprentissage/importFormations";
import { importFormationEtablissement } from "./jobs/formations/importFormationEtablissement";
import { importOnisep } from "./jobs/onisep/importOnisep";
import { importIndicateurEntree } from "./jobs/formations/importIndicateurEntree";
import { computeFormationTag } from "./jobs/formations/tag/computeFormationTag";
import {
  importIndicateurPoursuite,
  importIndicateurPoursuiteAnneeCommune,
} from "./jobs/formations/importIndicateurPoursuite";
import { importIdeoFichesFormations } from "./jobs/formations/importIdeoFichesFormations";
import { importRCO } from "./jobs/formations/importRCO";
import { splitIsochrones } from "./jobs/isochrones/splitIsochrones";
import { importIsochrones } from "./jobs/isochrones/importIsochrones.js";
import { importCertifInfo } from "./jobs/rco/importRCO.js";
import { importRome } from "./jobs/rome/importRome.js";
import { importRomeMetier } from "./jobs/rome/importRomeMetier.js";
import { importFormationSimilaire } from "./jobs/formations/importFormationSimilaire";
import { importFichesFormationsTmp } from "./jobs/formations/importFichesFormationsTmp";
import { importIndicateurPoursuiteRegionale } from "./jobs/exposition/importIndicateurPoursuiteRegionale";
import { importIndicateurPoursuiteNational } from "./jobs/exposition/importIndicateurPoursuiteNational";
import { importFamillesMetiers } from "./jobs/formations/importFamillesMetiers";
import { createSearchIndex, createSearchIndexReverse } from "./services/formation/search";
import { refreshView } from "./jobs/refreshView";
import { importKeyword } from "./jobs/formations/importKeyword";

const cli = new Command();

const BCNJobs = [
  { name: "BCN", job: importBCN },
  { name: "BCNMEF", job: importBCNMEF },
  { name: "BCNContinuum", job: importBCNContinuum },
  { name: "BCNContinuumMEF", job: computeBCNMEFContinuum },
  { name: "BCNLibelle", job: importLibelle },
];

const romeJobs = [
  { name: "rome", job: importRome },
  { name: "romeMetier", job: importRomeMetier },
];

const onisepJobs = [
  { name: "onisepTablePassage", job: () => importOnisep("tablePassageCodesCertifications") },
  { name: "onisepFormationsLycee", job: () => importOnisep("ideoActionsFormationInitialeUniversLycee") },
  { name: "onisepStructuresSecondaire", job: () => importOnisep("ideoStructuresEnseignementSecondaire") },
  { name: "onisepFormationsInitiales", job: () => importOnisep("ideoFormationsInitiales") },
  { name: "onisepMetiers", job: () => importOnisep("ideoMetiers") },
];

const RCOJobs = [
  { name: "RCOCertifInfo", job: () => importCertifInfo("certifInfo") },
  { name: "RCOCertificationRome", job: () => importCertifInfo("certificationRome") },
];

const formationEtablissementJobs = [
  { name: "feFormation", job: importFormation },
  { name: "feIdeoFichesFormations", job: importIdeoFichesFormations },
  { name: "feFichesFormationsTmp", job: importFichesFormationsTmp },
  { name: "feRCO", job: importRCO },
  { name: "feFE", job: importFormationEtablissement },
  { name: "feFamillesMetiers", job: importFamillesMetiers },
  { name: "feIndicateurEntree", job: importIndicateurEntree },
  { name: "feIndicateurPoursuiteRegionale", job: importIndicateurPoursuiteRegionale },
  { name: "feIndicateurPoursuiteNational", job: importIndicateurPoursuiteNational },
  { name: "feIndicateurPoursuite", job: importIndicateurPoursuite },
  { name: "feIndicateurPoursuiteAnneeCommune", job: importIndicateurPoursuiteAnneeCommune },
  { name: "feFormationTag", job: computeFormationTag },
  { name: "feFormationSimilaire", job: importFormationSimilaire },
  { name: "feKeyword", job: importKeyword },
  { name: "feSearchIndex", job: createSearchIndex },
  { name: "feSearchIndexReverse", job: createSearchIndexReverse },
];

const etablissementJobs = [
  { name: "etablissementACCE", job: importACCEEtablissements },
  { name: "etablissementEtablissement", job: importEtablissements },
];

const catalogueApprentissageJobs = [{ name: "caFormations", job: importCAFormations }];

const refreshViewJobs = [{ name: "refreshView", job: refreshView }];

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(() => runJobs(BCNJobs));
  });

cli
  .command("importRome")
  .description("Importe les données des ROMEs")
  .action(() => {
    runScript(() => runJobs(romeJobs));
  });

cli
  .command("importOnisep")
  .description("Importe les données de l'onisep")
  .action(() => {
    runScript(() => runJobs(onisepJobs));
  });

cli
  .command("importRCO")
  .description("Importe les données du réseau des Carif-Oref")
  .action(() => {
    runScript(() => runJobs(RCOJobs));
  });

cli
  .command("importEtablissements")
  .description("Importe les données d'établissements")
  .action(() => {
    runScript(() => runJobs(etablissementJobs));
  });

cli
  .command("importCatalogueApprentissage")
  .description("Importe les données du catalogue de l'apprentissage")
  .action(() => {
    runScript(() => runJobs(catalogueApprentissageJobs));
  });

cli
  .command("importFormationEtablissement")
  .description("Importe les formations dans les établissements")
  .action(() => {
    runScript(() => runJobs(formationEtablissementJobs));
  });

cli
  .command("importAll")
  .description("Effectue toute les taches d'importations et de calculs des données")
  .option("-j, --job <job>", "Nom du job à effectuer (tous si omit)")
  .action((options) => {
    const { job } = options;
    runScript(async () => {
      const importBCNStats = await runJobs(BCNJobs, job);
      const importOnisepStats = await runJobs(onisepJobs, job);
      const importRomeStats = await runJobs(romeJobs, job);
      const importRCOStats = await runJobs(RCOJobs, job);
      const importEtablissementsStats = await runJobs(etablissementJobs, job);
      const importCatalogueApprentissageStats = await runJobs(catalogueApprentissageJobs, job);
      const importFormationEtablissementStats = await runJobs(formationEtablissementJobs, job);
      const refreshView = await runJobs(refreshViewJobs, job);

      return {
        importBCNStats,
        importRomeStats,
        importOnisepStats,
        importEtablissementsStats,
        importCatalogueApprentissageStats,
        importFormationEtablissementStats,
        importRCOStats,
        refreshView,
      };
    });
  });

cli
  .command("scrapJPO")
  .description("Scrap les JPOs depuis le site de l'Onisep")
  .action(() => {
    runScript(async () => {
      const scrapJPOStats = await importEtablissementJPOScrapTmp();

      return scrapJPOStats;
    });
  });
cli
  .command("splitIsochrones")
  .description(
    `Simplifie et découpe un ensemble d'isochrones correspondant à plusieurs durées en utilisant PostGIS\n` +
      `Le dossier d'entrée contenant les isochrones doit avoir la structure suivante :\n` +
      `folder/[duration]/[name].json\n` +
      `Example : \n folder/5400/0010001W.json \n folder/3600/0010001W.json`
  )
  .requiredOption("-d, --db <db>", "URI de connexion PostgreSQL (nécessite PostGIS activé)")
  .requiredOption("-i, --input <input>", "Dossier contenant les isochrones")
  .requiredOption("-o, --output <output>", "Dossier de sortie")
  .requiredOption(
    "-k, --key <key>",
    "Geometry key path (lodash path format). \n Exemple pour Graphhopper : polygons[0].geometry"
  )
  .requiredOption(
    "-b, --buckets <buckets>",
    "Liste des durées des différents buckets en ordre décroissant (séparés par des virgules)",
    "5400,3600,2700,1800,900"
  )
  .action((options) => {
    const { input, output, buckets, key, db } = options;
    return splitIsochrones({
      input,
      output,
      key,
      buckets: buckets.split(",").map((b) => parseInt(b)),
      connectionString: db,
    });
  });

cli
  .command("importIsochrones")
  .description(
    `Import les isochrones dans PostgreSQL créés par splitIsochrones\n` +
      `Le dossier d'entrée contenant les isochrones doit avoir la structure suivante :\n` +
      `folder/[duration]/[name]_[number].json\n` +
      `Example : \n folder/5400/0010001W_0000.json \n folder/3600/0010001W_0000.json`
  )
  .requiredOption("-d, --db <db>", "URI de connexion PostgreSQL (nécessite PostGIS activé)")
  .requiredOption("-i, --input <input>", "Dossier contenant les isochrones")
  .option("-c, --caPath <caPath>", "Fichier du certificat PostgreSQL")
  .requiredOption(
    "-b, --buckets",
    "Liste des durées des différents buckets en ordre décroissant (séparés par des virgules)",
    "5400,3600,2700,1800,900"
  )
  .action((options) => {
    const { input, buckets, db, caPath } = options;
    return importIsochrones({
      input,
      buckets: buckets.split(",").map((b) => parseInt(b)),
      connectionString: db,
      caPath: caPath,
    });
  });

cli.parse(process.argv);
