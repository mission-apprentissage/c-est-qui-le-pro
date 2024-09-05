import { faker } from "@faker-js/faker"; // eslint-disable-line node/no-unpublished-import

export function createCodeFormationDiplome() {
  return faker.helpers.replaceSymbols("4#######");
}

export function createCodeRome() {
  return faker.helpers.replaceSymbols("A####");
}
