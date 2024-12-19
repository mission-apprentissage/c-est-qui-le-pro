import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB } from "../db/schema.js";

export class IndicateurEntreeRepository extends SqlRepository<DB, "indicateurEntree"> {
  constructor(kdb = defaultKdb) {
    super(
      "indicateurEntree",
      {
        id: null,
        formationEtablissementId: null,
        capacite: null,
        effectifs: null,
        effectifsAnnee: null,
        premiersVoeux: null,
        rentreeScolaire: null,
        tauxPression: null,
        createdAt: null,
        updatedAt: null,
      },
      kdb
    );
  }
}

export default new IndicateurEntreeRepository();
