import { SqlRepository } from "./base.js";
import { kdb as defaultKdb, kyselyChainFn } from "../db/db";
import { DB } from "../db/schema.js";
import { AnyAliasedColumn, ExpressionBuilder, SelectQueryBuilder, sql } from "kysely";
import IndicateurPoursuiteNationalRepository from "./indicateurPoursuiteNational.js";
import { getDiplomeType } from "shared";
import { omit } from "lodash-es";
import { logger } from "#src/common/logger.js";

export class FormationRepository extends SqlRepository<DB, "formation"> {
  constructor(kdb = defaultKdb) {
    super(
      "formation",
      {
        cfd: null,
        codeDiplome: null,
        codeDispositif: null,
        niveauDiplome: null,
        codeRncp: null,
        createdAt: null,
        description: null,
        descriptionAcces: null,
        descriptionPoursuiteEtudes: null,
        id: null,
        libelle: null,
        mef11: null,
        onisepIdentifiant: null,
        updatedAt: null,
        voie: null,
        familleMetierId: null,
        isAnneeCommune: null,
        sigle: null,
        formacode: null,
      },
      kdb
    );
  }

  _base({ withMetier, withPoursuite } = { withMetier: false, withPoursuite: false }) {
    return <T extends SelectQueryBuilder<DB, "formation", object>>(eb: T) => {
      return eb
        .leftJoinLateral(
          (eb) =>
            eb
              .selectFrom("formationDomainesView")
              .select("domaine")
              .whereRef("formation.id", "=", "formationDomainesView.formationId")
              .limit(1)
              .as("domaine"),
          (join) => join.on(sql`true`)
        )
        .$if(withPoursuite, (eb) =>
          eb.leftJoinLateral(
            (eb) =>
              eb
                .selectFrom("formationPoursuite")
                .select((eb) => {
                  return [
                    kyselyChainFn(
                      eb,
                      [
                        { fn: "to_jsonb", args: [] },
                        { fn: "json_agg", args: [] },
                      ],
                      sql`"formationPoursuite".*`
                    ).as("formationPoursuite"),
                  ];
                })
                .whereRef("formation.id", "=", "formationPoursuite.formationId")
                .as("formationPoursuite"),
            (join) => join.on(sql`true`)
          )
        )
        .$if(withMetier, (eb) =>
          eb.leftJoinLateral(
            (eb) =>
              eb
                .selectFrom("romeMetier")
                .innerJoin("formationRome", "romeMetier.rome", "formationRome.rome")
                .select((eb) => {
                  return [
                    kyselyChainFn(
                      eb,
                      [
                        { fn: "to_jsonb", args: [] },
                        { fn: "json_agg", args: [] },
                      ],
                      sql`"romeMetier".*`
                    ).as("metier"),
                  ];
                })
                .whereRef("formation.id", "=", "formationRome.formationId")
                .as("metier"),
            (join) => join.on(sql`true`)
          )
        );
    };
  }

  async get(
    { cfd, codeDispositif, voie },
    { withIndicateur, withMetier, withPoursuite } = { withIndicateur: false, withMetier: false, withPoursuite: false }
  ) {
    const formation = await this.kdb
      .selectFrom("formation")
      .$call(this._base({ withMetier, withPoursuite }))
      .selectAll()
      .where("cfd", "=", cfd)
      .where("voie", "=", voie)
      .where(({ eb }) => {
        return codeDispositif ? eb("codeDispositif", "=", codeDispositif) : eb("codeDispositif", "is", null);
      })
      .executeTakeFirst();

    if (withIndicateur) {
      const indicateurPoursuite =
        (await this.kdb
          .selectFrom("indicateurPoursuiteNational")
          .selectAll()
          .orderBy("millesime desc")
          .where("cfd", "=", cfd)
          .where("voie", "=", voie)
          .where(({ eb }) => {
            return codeDispositif ? eb("codeDispositif", "=", codeDispositif) : eb("codeDispositif", "is", null);
          })
          .limit(1)
          .executeTakeFirst()) || null;
      const indicateurPoursuiteSalaire =
        (await this.kdb
          .selectFrom("indicateurPoursuiteNational")
          .select("salaire_12_mois_q1")
          .select("salaire_12_mois_q2")
          .select("salaire_12_mois_q3")
          .orderBy("millesime desc")
          .where("salaire_12_mois_q1", "is not", null)
          .where("cfd", "=", cfd)
          .where("voie", "=", voie)
          .where(({ eb }) => {
            return codeDispositif ? eb("codeDispositif", "=", codeDispositif) : eb("codeDispositif", "is", null);
          })
          .limit(1)
          .executeTakeFirst()) || null;

      // Quartile salaire
      const diplomeType = getDiplomeType(formation.niveauDiplome);
      if (!diplomeType) {
        logger.error(`Type de diplome ${formation.niveauDiplome} inconnu`);
      }

      const quartileSalaire = await IndicateurPoursuiteNationalRepository.quartileForSalaire(diplomeType);
      if (quartileSalaire) {
        quartileSalaire["millesimeSalaire"] = quartileSalaire["millesime"];
      }

      return {
        indicateurPoursuite:
          !indicateurPoursuite && !indicateurPoursuiteSalaire
            ? null
            : {
                ...(indicateurPoursuite || {}),
                ...(indicateurPoursuiteSalaire || {}),
                ...omit(quartileSalaire || {}, ["millesime"]),
              },
        ...formation,
      };
    }

    return formation;
  }

  getKeyAlias<T extends keyof DB>(eb: ExpressionBuilder<DB, T>) {
    return [...super.getKeyAlias(eb)];
  }

  getKeyRelationAlias<T extends keyof DB>(_eb: ExpressionBuilder<DB, T>) {
    return [
      `domaine as ${this.tableName}.domaine` as AnyAliasedColumn<DB, T>,
      `formationPoursuite as ${this.tableName}.formationPoursuite` as AnyAliasedColumn<DB, T>,
      `metier as ${this.tableName}.metier` as AnyAliasedColumn<DB, T>,
    ];
  }

  async familleMetier(familleMetierId: string) {
    const formations = await this.kdb
      .selectFrom("formation")
      .$call(this._base())
      .selectAll()
      .where("familleMetierId", "=", familleMetierId)
      .execute();

    return formations;
  }
}

export default new FormationRepository();
