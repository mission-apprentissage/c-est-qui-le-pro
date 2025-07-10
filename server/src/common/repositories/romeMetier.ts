import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db.js";
import { DB, RomeMetierState } from "../db/schema.js";
import { DeleteResult, UpdateResult } from "kysely";

export const ROME_METIER_STATE: { [k: string]: RomeMetierState } = {
  updated: "updated",
  update_waiting: "update_waiting",
};

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
        state: null,
      },
      kdb
    );
  }

  async startUpdate() {
    const result = (await this.updateBy(
      {
        state: ROME_METIER_STATE.update_waiting,
      },
      {},
      false
    )) as UpdateResult[];
    return result ? Number(result[0].numUpdatedRows) : 0;
  }

  async removeStale() {
    const result = (await this.remove({ state: ROME_METIER_STATE.update_waiting }, false)) as DeleteResult[];
    return result ? Number(result[0].numDeletedRows) : 0;
  }
}

export default new RomeMetierRepository();
