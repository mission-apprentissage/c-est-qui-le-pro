import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB } from "../db/schema.js";
import FormationRepository from "./formation";
import EtablissementRepository from "./etablissement";
import { Readable } from "stream";
import { compose, transformData } from "oleoduc";
import { sql } from "kysely";
import { merge } from "lodash-es";

type QueryFormationEtablissement = Partial<{ [key in keyof DB["formationEtablissement"]]: string }>;
type QueryEtablissement = Partial<{ [key in keyof DB["etablissement"]]: string }>;
type QueryFormation = Partial<{ [key in keyof DB["formation"]]: string }>;

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
      },
      kdb
    );
  }

  //type test = { [k: keyof DB["formationEtablissement"]]: boolean };

  async first(
    query: QueryFormationEtablissement = {},
    etablissementQuery: QueryEtablissement = {},
    formationQuery: QueryFormation = {}
  ) {
    const result = await this.kdb
      .selectFrom(this.tableName)
      .select((eb) => this.getKeyAlias(eb))
      .select((eb) => [...EtablissementRepository.getKeyAlias(eb), ...EtablissementRepository.getKeyRelationAlias()])
      .select((eb) => [...FormationRepository.getKeyAlias(eb), ...FormationRepository.getKeyRelationAlias()])
      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom("formation")
            .$call(FormationRepository._base())
            .whereRef("formationEtablissement.formationId", "=", "formation.id")
            .as("formation"),
        (join) => join.on(sql`true`)
      )
      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom("etablissement")
            .$call(EtablissementRepository._base())
            .whereRef("formationEtablissement.etablissementId", "=", "etablissement.id")
            .as("etablissement"),
        (join) => join.on(sql`true`)
      )
      .where(({ eb, and }) =>
        and([
          ...this._createWhere(eb, query),
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
    const formationEtablissement = await this.first({}, { uai }, { mef11 });

    if (!formationEtablissement) {
      return null;
    }

    return formationEtablissement;
  }

  async getFromCfd({ uai, cfd, codeDispositif, voie }, withIndicateur = false) {
    const formationEtablissement = await this.first({}, { uai }, { cfd, codeDispositif, voie });

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

      return merge(formationEtablissement, { formationEtablissement: { indicateurEntree, indicateurPoursuite } });
    }

    return formationEtablissement;
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
}

export default new FormationEtablissementRepository();
