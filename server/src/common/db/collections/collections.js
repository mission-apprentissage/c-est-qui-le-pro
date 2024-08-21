import * as logsDescriptor from "./logs.js";
import * as metricsDescriptor from "./metrics.js";
import * as bcnDescriptor from "./bcn.js";
import * as bcnMefDescriptor from "./bcn_mef.js";
import * as acceEtablissementsDescriptor from "./acceEtablissements.js";
import * as catalogueApprentissageFormationsDescriptor from "./catalogueApprentissageFormations.js";
import * as formationEtablissementDescriptor from "./formationEtablissement.js";
import * as formationDescriptor from "./formation.js";
import * as etablissementDescriptor from "./etablissement.js";
import * as onisepRawDescriptor from "./onisepRaw.js";
import { dbCollection } from "#src/common/db/mongodb.js";

export function getCollectionDescriptors() {
  return [
    logsDescriptor,
    metricsDescriptor,
    bcnDescriptor,
    bcnMefDescriptor,
    acceEtablissementsDescriptor,
    catalogueApprentissageFormationsDescriptor,
    formationEtablissementDescriptor,
    formationDescriptor,
    etablissementDescriptor,
    onisepRawDescriptor,
  ];
}

export function logs() {
  return dbCollection(logsDescriptor.name);
}

export function metrics() {
  return dbCollection(metricsDescriptor.name);
}

export function bcn() {
  return dbCollection(bcnDescriptor.name);
}

export function bcnMef() {
  return dbCollection(bcnMefDescriptor.name);
}

export function acceEtablissements() {
  return dbCollection(acceEtablissementsDescriptor.name);
}

export function CAFormations() {
  return dbCollection(catalogueApprentissageFormationsDescriptor.name);
}

export function formationEtablissement() {
  return dbCollection(formationEtablissementDescriptor.name);
}

export function etablissement() {
  return dbCollection(etablissementDescriptor.name);
}

export function formation() {
  return dbCollection(formationDescriptor.name);
}

export function onisepRaw() {
  return dbCollection(onisepRawDescriptor.name);
}
