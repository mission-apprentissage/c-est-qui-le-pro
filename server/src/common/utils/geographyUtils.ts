import { mapValues } from "lodash-es";
import transformation from "transform-coordinates";

const departementInseeToProjection = {
  default: "EPSG:2154", // Projection de la métropole (lambert-93)
  "985": "EPSG:4471", // Mayotte (ancien  code)
  "978": "EPSG:4559", // Saint-Martin
  "977": "EPSG:4559", // Saint-Barthélémy
  "976": "EPSG:4471", // Mayotte
  "975": "EPSG:4467", // St-Pierre-et-Miquelon
  "974": "EPSG:2975", // La Réunion
  "973": "EPSG:2972", // Guyane
  "972": "EPSG:4559", // Martinique
  "971": "EPSG:4559", // Guadeloupe
  // Département non geré
  //"988": "", // Nouvelle Calédonie
  //"987": "", // Polynésie Française
  //"986": ""; // Wallis et Futuna
};

const transformations = mapValues(departementInseeToProjection, (data) => transformation(data, "EPSG:4326"));

export function transformCoordinate(departementInsee: string, x: string, y: string) {
  if (!x || !y) {
    return null;
  }

  if (transformations[departementInsee]) {
    return transformations[departementInsee].forward({ x: parseFloat(x), y: parseFloat(y) });
  }

  return transformations["default"].forward({ x: parseFloat(x), y: parseFloat(y) });
}
