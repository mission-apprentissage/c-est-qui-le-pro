import { SqlRepository, WhereObject } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB, FormationEtablissementState } from "../db/schema.js";
import FormationRepository from "./formation";
import EtablissementRepository from "./etablissement";
import { Readable } from "stream";
import { compose, transformData } from "oleoduc";
import { DeleteResult, sql, UpdateResult } from "kysely";
import { merge } from "lodash-es";
import IndicateurPoursuiteRepository from "./indicateurPoursuite.js";
import { getDiplomeType } from "shared";

type QueryFormationEtablissement = Partial<WhereObject<DB, "formationEtablissement">>;
type QueryEtablissement = Partial<WhereObject<DB, "etablissement">>;
type QueryFormation = Partial<WhereObject<DB, "formation">>;

export const FORMATION_ETABLISSEMENT_STATE: { [k: string]: FormationEtablissementState } = {
  updated: "updated",
  update_waiting: "update_waiting",
};

export class FormationEtablissementRepository extends SqlRepository<DB, "formationEtablissement"> {
  constructor(kdb = defaultKdb) {
    super(
      "formationEtablissement",
      {
        createdAt: null,
        duree: null,
        etablissementId: null,
        formationId: null,
        id: null,
        millesime: null,
        tags: null,
        updatedAt: null,
        state: null,
      },
      kdb
    );
  }

  async firstWithData(
    query: QueryFormationEtablissement = {},
    etablissementQuery: QueryEtablissement = {},
    formationQuery: QueryFormation = {}
  ) {
    const result = await this.kdb
      .selectFrom("formationEtablissement")
      .select((eb) => this.getKeyAlias(eb))
      .select((eb) => [...EtablissementRepository.getKeyAlias(eb), ...EtablissementRepository.getKeyRelationAlias()])

      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom(
              eb
                .selectFrom("formation")
                .$call(FormationRepository._base({ withMetier: true, withPoursuite: true }))
                .selectAll()
                .as("formation")
            )
            .selectAll()
            .whereRef("formationEtablissement.formationId", "=", "formation.id")
            .as("formation"),
        (join) => join.on(sql`true`)
      )
      .select((eb) => [...FormationRepository.getKeyAlias(eb), ...FormationRepository.getKeyRelationAlias(eb)])

      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom(
              eb.selectFrom("etablissement").$call(EtablissementRepository._base()).selectAll().as("etablissement")
            )
            .selectAll()
            .whereRef("formationEtablissement.etablissementId", "=", "etablissement.id")
            .as("etablissement"),
        (join) => join.on(sql`true`)
      )
      .where(({ eb, and }) =>
        and([
          ...this._createWhere(eb, query, "formationEtablissement"),
          ...EtablissementRepository._createWhere(eb, etablissementQuery, "etablissement"),
          ...FormationRepository._createWhere(eb, formationQuery, "formation"),
        ])
      )
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return {
      formation: this.getColumnWithoutAlias("formation", result),
      etablissement: this.getColumnWithoutAlias("etablissement", result),
      formationEtablissement: this.getColumnWithoutAlias("formationEtablissement", result),
    };
  }

  async getFromMef({ uai, mef11 }) {
    const formationEtablissement = await this.firstWithData({}, { uai }, { mef11 });

    if (!formationEtablissement) {
      return null;
    }

    return formationEtablissement;
  }

  async getFromCfd({ uai, cfd, codeDispositif, voie }, withIndicateur = false) {
    let formationEtablissement = await this.firstWithData({}, { uai }, { cfd, codeDispositif, voie });

    if (!formationEtablissement) {
      return null;
    }

    if (withIndicateur) {
      const indicateurEntree = await this.kdb
        .selectFrom("indicateurEntree")
        .selectAll()
        .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
        .orderBy("rentreeScolaire desc")
        .limit(1)
        .executeTakeFirst();

      const indicateurPoursuite = await this.kdb
        .selectFrom("indicateurPoursuite")
        .selectAll()
        .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
        .orderBy("millesime desc")
        .limit(1)
        .executeTakeFirst();

      const indicateurPoursuiteAnneeCommune = formationEtablissement.formation.isAnneeCommune
        ? await this.kdb
            .selectFrom("indicateurPoursuiteAnneeCommune")
            .selectAll()
            .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
            .where("millesime", "=", (eb) =>
              eb
                .selectFrom("indicateurPoursuiteAnneeCommune")
                .select("millesime")
                .where("formationEtablissementId", "=", formationEtablissement.formationEtablissement.id)
                .orderBy("millesime desc")
                .limit(1)
            )
            .execute()
        : null;

      const diplomeType = getDiplomeType(formationEtablissement.formation.niveauDiplome);
      const indicateurPoursuiteRegional = diplomeType
        ? await IndicateurPoursuiteRepository.quartileFor(diplomeType, formationEtablissement.etablissement.region)
        : null;

      formationEtablissement = merge(formationEtablissement, {
        formationEtablissement: {
          indicateurEntree,
          indicateurPoursuite,
          indicateurPoursuiteAnneeCommune,
          indicateurPoursuiteRegional,
        },
      });
    }

    return formationEtablissement;
  }

  async getFormationsFamilleMetier({ familleMetierId, isAnneeCommune, uai }) {
    const formations = await this.kdb
      .selectFrom("formation")
      .selectAll()
      .where("familleMetierId", "=", familleMetierId)
      .where("isAnneeCommune", "!=", isAnneeCommune)
      .orderBy("libelle")
      .execute();

    if (formations.length === 0) {
      return null;
    }

    const results = await Promise.all(
      formations.map(async (formationFamilleMetier) => {
        return {
          formation: formationFamilleMetier,
          ...(await this.getFromCfd(
            {
              uai: uai,
              cfd: formationFamilleMetier.cfd,
              codeDispositif: formationFamilleMetier.codeDispositif,
              voie: formationFamilleMetier.voie,
            },
            true
          )),
        };
      })
    );

    return Object.values(
      results.reduce((acc, f) => {
        acc[f.formation.libelle] = {
          ...(acc[f.formation.libelle] && acc[f.formation.libelle].formationEtablissement ? {} : { ...f }),
        };
        return acc;
      }, {})
    );
  }

  async find(
    where: Partial<
      WhereObject<DB, "formationEtablissement"> | WhereObject<DB, "formation"> | WhereObject<DB, "etablissement">
    > | null,
    returnStream = true
  ) {
    const query = this.kdb
      .selectFrom(this.tableName)
      .select((eb) => this.getKeyAlias(eb))
      .select((eb) => EtablissementRepository.getKeyAlias(eb))
      .select((eb) => FormationRepository.getKeyAlias(eb))
      .innerJoin("etablissement", "etablissement.id", "etablissementId")
      .innerJoin("formation", "formation.id", "formationId");
    const queryCond = where ? query.where((eb) => eb.and(where as any)) : query;
    const result = queryCond.stream();

    if (!returnStream) {
      return queryCond.execute();
    }

    return compose(
      Readable.from(result),
      transformData((result) => {
        return {
          formation: this.getColumnWithoutAlias("formation", result),
          etablissement: this.getColumnWithoutAlias("etablissement", result),
          formationEtablissement: this.getColumnWithoutAlias("formationEtablissement", result),
        };
      })
    );
  }

  async getAll() {
    const result = this.kdb
      .selectFrom(this.tableName)
      .select((eb) => this.getKeyAlias(eb))
      .select((eb) => EtablissementRepository.getKeyAlias(eb))
      .select((eb) => FormationRepository.getKeyAlias(eb))
      .innerJoin("etablissement", "etablissement.id", "etablissementId")
      .innerJoin("formation", "formation.id", "formationId")
      .stream();

    return compose(
      Readable.from(result),
      transformData((result) => {
        return {
          formation: this.getColumnWithoutAlias("formation", result),
          etablissement: this.getColumnWithoutAlias("etablissement", result),
          formationEtablissement: this.getColumnWithoutAlias("formationEtablissement", result),
        };
      })
    );
  }

  async startUpdate() {
    const result = (await this.updateBy(
      {
        state: FORMATION_ETABLISSEMENT_STATE.update_waiting,
      },
      {},
      false
    )) as UpdateResult[];
    return result ? Number(result[0].numUpdatedRows) : 0;
  }

  async removeStale() {
    const result = (await this.remove(
      { state: FORMATION_ETABLISSEMENT_STATE.update_waiting },
      false
    )) as DeleteResult[];
    return result ? Number(result[0].numDeletedRows) : 0;
  }
}

export default new FormationEtablissementRepository();
