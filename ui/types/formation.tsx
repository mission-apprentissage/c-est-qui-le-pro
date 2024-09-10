import * as yup from "yup";

export const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
export const CFD_PATTERN = /^[0-9A-Z]{8}$/;

export enum FormationTag {
  POUR_TRAVAILLER_RAPIDEMENT = "pour_travailler_rapidement",
  ADMISSION_FACILE = "admission_facile",
}

// TODO : fetch domaine from API
export enum FormationDomaine {
  "tout" = "tout",
  "agriculture, animaux" = "agriculture, animaux",
  "armée, sécurité" = "armée, sécurité",
  "arts, culture, artisanat" = "arts, culture, artisanat",
  "banque, assurances, immobilier" = "banque, assurances, immobilier",
  "commerce, marketing, vente" = "commerce, marketing, vente",
  "construction, architecture, travaux publics" = "construction, architecture, travaux publics",
  "économie, droit, politique" = "économie, droit, politique",
  "électricité, électronique, robotique" = "électricité, électronique, robotique",
  "environnement, énergies, propreté" = "environnement, énergies, propreté",
  "gestion des entreprises, comptabilité" = "gestion des entreprises, comptabilité",
  "histoire-géographie, psychologie, sociologie" = "histoire-géographie, psychologie, sociologie",
  "hôtellerie-restauration, tourisme" = "hôtellerie-restauration, tourisme",
  "information-communication, audiovisuel" = "information-communication, audiovisuel",
  "informatique, Internet" = "informatique, Internet",
  "lettres, langues, enseignement" = "lettres, langues, enseignement",
  "logistique, transport" = "logistique, transport",
  "matières premières, fabrication, industries" = "matières premières, fabrication, industries",
  "mécanique" = "mécanique",
  "santé, social, sport" = "santé, social, sport",
  "sciences" = "sciences",
}

export enum FormationVoie {
  SCOLAIRE = "scolaire",
  APPRENTISSAGE = "apprentissage",
}

export const formationTagSchema: yup.StringSchema<FormationTag> = yup
  .string()
  .oneOf(Object.values(FormationTag))
  .required();

type IndicateurEntree = {
  rentreeScolaire: string;
  capacite?: number;
  premiersVoeux?: number;
  tauxPression?: number;
};

type IndicateurPoursuite = {
  millesime: string;
  taux_en_emploi_6_mois?: number;
  taux_en_formation?: number;
  taux_autres_6_mois?: number;
};

type FormationPoursuite = {
  type?: string;
  libelle: string;
  onisepId?: string;
};

export type FormationEtablissement = {
  id: string;
  duree?: string;
  tags?: FormationTag[] | null;
  indicateurEntree?: IndicateurEntree;
  indicateurPoursuite?: IndicateurPoursuite;
};

export type Formation = {
  id: string;
  cfd: string;
  libelle?: string;
  description?: string;
  descriptionAcces?: string;
  descriptionPoursuiteEtudes?: string;
  onisepIdentifiant?: string;
  voie: FormationVoie;
  codeDispositif?: string;
  mef11?: string;
  codeDiplome?: string;
  codeRncp?: string;
  formationPoursuite?: FormationPoursuite[];
};

type JourneesPortesOuverteDate = {
  from?: Date;
  to?: Date;
  details?: string;
  fullDay?: boolean;
};

export type JourneesPortesOuverte = {
  dates?: JourneesPortesOuverteDate[];
  details?: string;
};

export type Etablissement = {
  id: string;
  statut?: string;
  url?: string;
  libelle?: string;
  uai: string;
  onisepId?: string;
  journeesPortesOuvertes?: JourneesPortesOuverte;

  JPODates?: JourneesPortesOuverteDate[] | null;
  JPODetails?: string | null;

  addressStreet?: string;
  addressPostCode?: string;
  addressCity?: string;
  latitude?: number;
  longitude?: number;
  accessTime?: number;
  distance?: number;
};

export type FormationDetail = {
  formationEtablissement: FormationEtablissement;
  formation: Formation;
  etablissement: Etablissement;
};

export const formationDetailSchema: yup.ObjectSchema<FormationDetail> = yup.object({
  formationEtablissement: yup
    .object()
    .concat(
      yup.object().shape({
        id: yup.string().required(),
        duree: yup.string(),
        tags: yup
          .array(yup.string().oneOf(Object.values(FormationTag)).required())
          .nullable()
          .default([]),
        indicateurEntree: yup
          .object({
            rentreeScolaire: yup.string().required(),
            capacite: yup.number(),
            premiersVoeux: yup.number(),
            tauxPression: yup.number(),
          })
          .default(undefined),
        indicateurPoursuite: yup
          .object({
            millesime: yup.string().required(),
            taux_en_emploi_6_mois: yup.number(),
            taux_en_formation: yup.number(),
            taux_autres_6_mois: yup.number(),
          })
          .default(undefined),
      })
    )
    .required(),
  formation: yup.object().concat(
    yup.object().shape({
      id: yup.string().required(),
      cfd: yup.string().required(),
      libelle: yup.string(),
      voie: yup.string().oneOf(Object.values(FormationVoie)).required(),
    })
  ),
  etablissement: yup
    .object()
    .concat(
      yup.object().shape({
        id: yup.string().required(),
        uai: yup.string().required(),
        JPODates: yup
          .array()
          .of(
            yup.object({
              from: yup.date().transform((value) => new Date(value)),
              to: yup.date().transform((value) => new Date(value)),
              details: yup.string(),
              fullDay: yup.boolean(),
            })
          )
          .nullable()
          .default(null),
        JPODetails: yup.string().nullable().default(null),
      })
    )
    .required(),
});
