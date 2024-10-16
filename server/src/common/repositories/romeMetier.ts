import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class RomeMetierRepository extends SqlRepository<DB, "romeMetier"> {
  constructor(kdb = defaultKdb) {
    super(
      "romeMetier",
      {
        id: null,
        rome: null,
        libelle: null,
        onisepLibelle: null,
        onisepLink: null,
        franceTravailLink: null,
        franceTravailLibelle: null,
        transitionEcologique: null,
        transitionEcologiqueDetaillee: null,
        transitionNumerique: null,
        transitionDemographique: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new RomeMetierRepository();
