import "dotenv/config";
import { Command } from "commander";
import { runScript } from "./common/runScript.js";
import { importBCN } from "./jobs/bcn/importBCN.js";
import { importBCNMEF } from "./jobs/bcn/importBCNMEF.js";
import { importBCNContinuum } from "./jobs/bcn/importBCNContinuum.js";
import { computeBCNMEFContinuum } from "./jobs/bcn/computeBCNMEFContinuum.js";
import { importLibelle } from "./jobs/bcn/importLibelle.js";
import { importACCEEtablissements } from "./jobs/etablissements/importACCEEtablissements.js";
import { importEtablissements } from "./jobs/etablissements/importEtablissements.js";
import { importFormation } from "./jobs/formations/importFormation.js";
import { importFormations as importCAFormations } from "./jobs/catalogueApprentissage/importFormations.js";
import { importFormationEtablissement } from "./jobs/formations/importFormationEtablissement.js";
import { importOnisep } from "./jobs/onisep/importOnisep.js";
import { importIndicateurEntree } from "./jobs/formations/importIndicateurEntree.js";
import { computeFormationTag } from "./jobs/formations/tag/computeFormationTag.js";
import { importIndicateurPoursuite } from "./jobs/formations/importIndicateurPoursuite.js";
import { importIdeoFichesFormations } from "./jobs/formations/importIdeoFichesFormations.js";

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

async function importFormationEtablissementCommand() {
  const importFormationStats = await importFormation();
  const importIdeoFichesFormationsStats = await importIdeoFichesFormations();
  const importFormationEtablissementStats = await importFormationEtablissement();
  const importIndicateurEntreeStats = await importIndicateurEntree();
  const importIndicateurPoursuiteStats = await importIndicateurPoursuite();
  const computeFormationTagStats = await computeFormationTag();

  return {
    importFormationStats,
    importIdeoFichesFormationsStats,
    importFormationEtablissementStats,
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
  .command("importOnisep")
  .description("Importe les données de l'onisep")
  .action(() => {
    runScript(importOnisepCommand);
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
  .command("importAll")
  .description("Effectue toute les taches d'importations et de calculs des données")
  .action(() => {
    runScript(async () => {
      const importBCNStats = await importBCNCommand();
      const importOnisepStats = await importOnisepCommand();
      const importEtablissementsStats = await importEtablissementCommand();
      const importCatalogueApprentissageStats = await importCAFormations();
      const importFormationEtablissementStats = await importFormationEtablissementCommand();

      return {
        importBCNStats,
        importOnisepStats,
        importEtablissementsStats,
        importCatalogueApprentissageStats,
        importFormationEtablissementStats,
      };
    });
  });

cli.parse(process.argv);
