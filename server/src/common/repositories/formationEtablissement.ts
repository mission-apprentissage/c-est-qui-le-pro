import { SqlRepository } from "./base.js";
import { kdb as defaultKdb } from "../db/db";
import { DB } from "../db/schema.js";
import FormationRepository from "./formation";
import EtablissementRepository from "./etablissement";
import { Readable } from "stream";
import { compose, transformData } from "oleoduc";
import { sql } from "kysely";
import { merge } from "lodash-es";
import IndicateurPoursuiteRepository from "./indicateurPoursuite.js";
import { getDiplomeType } from "shared";

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
      // Formation de spécialisation de la famille de métiers
      .leftJoinLateral(
        (eb) =>
          eb
            .selectFrom((eb) =>
              eb
                .selectFrom("formation as fMetier")
                .leftJoinLateral(
                  (eb) =>
                    eb
                      .selectFrom("formationEtablissement as feMetier")
                      .innerJoin("etablissement as eEtablissement", "feMetier.etablissementId", "eEtablissement.id")
                      .whereRef("feMetier.formationId", "=", "fMetier.id")
                      .whereRef("feMetier.etablissementId", "=", "etablissement.id")
                      .whereRef("millesime", "&&", "formationEtablissement.millesime")
                      .select((eb) => eb.fn("row_to_json", [sql`"feMetier"`]).as("formationEtablissement"))
                      .select((eb) => eb.fn("row_to_json", [sql`"eEtablissement"`]).as("etablissement"))
                      .select("feMetier.id as formationEtablissementId")
                      .select(sql.val("1").as("exist"))
                      .select("feMetier")
                      .as("feMetier"),
                  (join) => join.on(sql`true`)
                )
                .distinctOn("libelle")
                .select((eb) => eb.fn("row_to_json", [sql`"fMetier"`]).as("formation"))
                .select("formationEtablissement")
                .select("etablissement")
                .select("libelle")
                .select("exist")
                .whereRef("fMetier.familleMetierId", "=", "formation.familleMetierId")
                .whereRef("isAnneeCommune", "!=", "formation.isAnneeCommune")
                .orderBy(["fMetier.libelle", "exist"])
                .as("formationsFamilleMetier")
            )
            .select(
              sql`json_agg(to_jsonb("formationsFamilleMetier") - 'libelle' - 'exist' ORDER BY "exist", "formationsFamilleMetier".libelle)`.as(
                "formationsFamilleMetier"
              )
            )
            .as("formationsFamilleMetier"),
        (join) => join.on(sql`true`)
      )
      .select("formationsFamilleMetier")
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
      formationsFamilleMetier: result.formationsFamilleMetier,
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

      const diplomeType = getDiplomeType(formationEtablissement.formation.niveauDiplome);
      const indicateurPoursuiteRegional = diplomeType
        ? await IndicateurPoursuiteRepository.quartileFor(diplomeType, formationEtablissement.etablissement.region)
        : null;

      formationEtablissement = merge(formationEtablissement, {
        formationEtablissement: { indicateurEntree, indicateurPoursuite, indicateurPoursuiteRegional },
      });
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
