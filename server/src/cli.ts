import "dotenv/config";
import { Command } from "commander";
import { runScript } from "./common/runScript.js";
import { importBCN } from "./jobs/bcn/importBCN";
import { importBCNMEF } from "./jobs/bcn/importBCNMEF";
import { importBCNContinuum } from "./jobs/bcn/importBCNContinuum";
import { computeBCNMEFContinuum } from "./jobs/bcn/computeBCNMEFContinuum";
import { importLibelle } from "./jobs/bcn/importLibelle";
import { importACCEEtablissements } from "./jobs/etablissements/importACCEEtablissements";
import { importEtablissements } from "./jobs/etablissements/importEtablissements";
import { importFormation } from "./jobs/formations/importFormation";
import { importFormations as importCAFormations } from "./jobs/catalogueApprentissage/importFormations";
import { importFormationEtablissement } from "./jobs/formations/importFormationEtablissement";
import { importOnisep } from "./jobs/onisep/importOnisep";
import { importIndicateurEntree } from "./jobs/formations/importIndicateurEntree";
import { computeFormationTag } from "./jobs/formations/tag/computeFormationTag";
import { importIndicateurPoursuite } from "./jobs/formations/importIndicateurPoursuite";
import { importIdeoFichesFormations } from "./jobs/formations/importIdeoFichesFormations";
import { importRCO } from "./jobs/formations/importRCO";
import { splitIsochrones } from "./jobs/isochrones/splitIsochrones";
import { importIsochrones } from "./jobs/isochrones/importIsochrones.js";
import { importCertifInfo } from "./jobs/rco/importRCO.js";
import { importRome } from "./jobs/rome/importRome.js";
import { importRomeMetier } from "./jobs/rome/importRomeMetier.js";

const cli = new Command();

async function importBCNCommand() {
  const statsBCN = await importBCN();
  const statsMef = await importBCNMEF();
  const statsContinuum = await importBCNContinuum();
  const statsMefContinuum = await computeBCNMEFContinuum();
  const statsBCNLibelle = await importLibelle();

  return {
    statsBCN,
    statsMef,
    statsContinuum,
    statsMefContinuum,
    statsBCNLibelle,
  };
}

async function importRomeCommand() {
  return {
    importRome: await importRome(),
    importRomeMetier: await importRomeMetier(),
  };
}

async function importOnisepCommand() {
  return {
    importTablePassage: await importOnisep("tablePassageCodesCertifications", ["certif_info_ci_identifiant"]),
    importFormationsLycee: await importOnisep("ideoActionsFormationInitialeUniversLycee", [
      "action_de_formation_af_identifiant_onisep",
      "ens_code_uai",
    ]),
    importStructuresSecondaire: await importOnisep("ideoStructuresEnseignementSecondaire", ["code_uai"]),
    importFormationsInitiales: await importOnisep("ideoFormationsInitiales", ["url_et_id_onisep", "duree"]),
  };
}

async function importRCOCommand() {
  return {
    importCertifInfo: await importCertifInfo("certifInfo"),
    importCertificationRome: await importCertifInfo("certificationRome"),
  };
}

async function importFormationEtablissementCommand() {
  const importFormationStats = await importFormation();
  const importIdeoFichesFormationsStats = await importIdeoFichesFormations();
  const importRCOStats = await importRCO();
  const importFormationEtablissementStats = await importFormationEtablissement();
  const importIndicateurEntreeStats = await importIndicateurEntree();
  const importIndicateurPoursuiteStats = await importIndicateurPoursuite();
  const computeFormationTagStats = await computeFormationTag();

  return {
    importFormationStats,
    importIdeoFichesFormationsStats,
    importFormationEtablissementStats,
    importRCOStats,
    importIndicateurEntreeStats,
    importIndicateurPoursuiteStats,
    computeFormationTagStats,
  };
}

async function importEtablissementCommand() {
  const importACCEEtablissementsStats = await importACCEEtablissements();
  const importEtablissementsStats = await importEtablissements();

  return {
    importACCEEtablissementsStats,
    importEtablissementsStats,
  };
}

cli
  .command("importBCN")
  .description("Import les CFD et MEF depuis la BCN")
  .action(() => {
    runScript(importBCNCommand);
  });

cli
  .command("importRome")
  .description("Importe les données des ROMEs")
  .action(() => {
    runScript(importRomeCommand);
  });

cli
  .command("importOnisep")
  .description("Importe les données de l'onisep")
  .action(() => {
    runScript(importOnisepCommand);
  });

cli
  .command("importRCO")
  .description("Importe les données du réseau des Carif-Oref")
  .action(() => {
    runScript(importRCOCommand);
  });

cli
  .command("importEtablissements")
  .description("Importe les données d'établissements")
  .action(() => {
    runScript(importEtablissementCommand);
  });

cli
  .command("importCatalogueApprentissage")
  .description("Importe les données du catalogue de l'apprentissage")
  .action(() => {
    runScript(importCAFormations);
  });

cli
  .command("importFormationEtablissement")
  .description("Importe les formations dans les établissements")
  .action(() => {
    runScript(importFormationEtablissementCommand);
  });

cli
  .command("computeTags")
  .description("Calcule les tags de formations")
  .action(() => {
    runScript(computeFormationTag);
  });

cli
  .command("importAll")
  .description("Effectue toute les taches d'importations et de calculs des données")
  .action(() => {
    runScript(async () => {
      const importBCNStats = await importBCNCommand();
      const importRomeStats = await importRomeCommand();
      const importOnisepStats = await importOnisepCommand();
      const importEtablissementsStats = await importEtablissementCommand();
      const importCatalogueApprentissageStats = await importCAFormations();
      const importFormationEtablissementStats = await importFormationEtablissementCommand();
      const importRCOStats = await importRCOCommand();

      return {
        importBCNStats,
        importRomeStats,
        importOnisepStats,
        importEtablissementsStats,
        importCatalogueApprentissageStats,
        importFormationEtablissementStats,
        importRCOStats,
      };
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
    "-b, --buckets",
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
