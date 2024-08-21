import nock from "nock"; // eslint-disable-line node/no-unpublished-import
import { generateCodeCertification } from "./testUtils.js";
import { DataGouvApi } from "#src/services/dataGouv/DataGouvApi.js";
import { CatalogueApprentissageApi } from "#src/services/catalogueApprentissage/CatalogueApprentissageApi.js";
import * as Fixtures from "#tests/utils/fixtures.js";

function createNock(baseUrl, options = {}) {
  let client = nock(baseUrl);
  return options.stack ? client : client.persist();
}

export function mockBCN(callback, options) {
  let client = createNock(`https://infocentre.pleiade.education.fr/bcn/index.php/export`, options);
  callback(client);

  return client;
}

export function mockDataGouv(callback, options) {
  let client = createNock(DataGouvApi.baseApiUrl, options);
  callback(client);

  return client;
}

export async function mockCatalogueApprentissageApi(callback, options) {
  let client = createNock(CatalogueApprentissageApi.baseApiUrl, options);

  const formationCatalogue = await Fixtures.FormationsCatalogue();
  const etablissementsCatalogue = await Fixtures.EtablissementsCatalogue();
  const etablissementCatalogue = await Fixtures.EtablissementCatalogue();

  callback(client, {
    formations(custom = {}) {
      return Object.assign({}, formationCatalogue, custom);
    },
    etablissements(custom = {}) {
      return Object.assign({}, etablissementsCatalogue, custom);
    },
    etablissement(custom = {}) {
      return Object.assign({}, etablissementCatalogue, custom);
    },
  });

  return client;
}
