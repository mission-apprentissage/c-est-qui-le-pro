import * as yup from "yup";

export const UAI_PATTERN = /^[0-9]{7}[A-Z]{1}$/;
export const CFD_PATTERN = /^[0-9A-Z]{8}$/;

export const THRESHOLD_TAUX_PRESSION = [1, 1.42];

export const DiplomeType = {
  BAC_PRO: ["400", "403"], // Bac pro et bac pro agricole
  CAP: ["500", "503"], // cap et cap agricole
  BP: ["450", "553"], // BP et BP agricole
};

export const DiplomeTypeLibelle: { [key: string]: string } = {
  "400": "BAC PRO",
  "403": "BAC PRO AG",
  "500": "CAP",
  "503": "CAPA",
  "450": "BREVET PRO",
  "553": "BREVET PRO AG",
};

export const DiplomeSynonyms: { [K in keyof typeof DiplomeType]: string[] } = {
  BAC_PRO: [
    "bac pro",
    "bac",
    "baccalaureat",
    "classe de seconde professionnelle",
    "seconde professionnelle",
    "seconde commune",
    "seconde",
    "2nd",
    "2nde",
  ],
  CAP: ["certificat d'aptitude professionnelle", "cap", "capa"],
  BP: ["brevet professionel", "bp"],
};

export enum FormationTag {
  POUR_TRAVAILLER_RAPIDEMENT = "pour_travailler_rapidement",
  FAIBLE_TAUX_PRESSION = "faible_taux_pression",
  TRANSITION_ECOLOGIQUE = "transition_ecologique",
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

export type IndicateurEntree = {
  rentreeScolaire: string;
  capacite?: number;
  premiersVoeux?: number;
  voeux?: number;
  tauxPression?: number;
  effectifs?: number;
};

export type IndicateurPoursuite = {
  millesime: string;
  part_en_emploi_6_mois?: number;
  taux_en_emploi_6_mois?: number;
  taux_en_formation?: number;
  taux_autres_6_mois?: number;
};

export type IndicateurPoursuiteAnneeCommune = {
  millesime: string;
  codeCertification: string;
  libelle?: string;
  part_en_emploi_6_mois?: number;
  taux_en_emploi_6_mois?: number;
  taux_en_formation?: number;
  taux_autres_6_mois?: number;
};

export type IndicateurPoursuiteRegional = {
  millesime: string;
  region: string;
  voie?: string;
  part_en_emploi_6_mois?: number;
  taux_en_formation_q0: number;
  taux_en_formation_q1: number;
  taux_en_formation_q2: number;
  taux_en_formation_q3: number;
  taux_en_formation_q4: number;
  taux_en_emploi_6_mois_q0: number;
  taux_en_emploi_6_mois_q1: number;
  taux_en_emploi_6_mois_q2: number;
  taux_en_emploi_6_mois_q3: number;
  taux_en_emploi_6_mois_q4: number;
};

type IndicateurPoursuiteNational = {
  millesime: string;
  part_en_emploi_6_mois?: number;
  taux_en_formation?: number;
  taux_autres_6_mois?: number;
  millesimeSalaire?: string;
  salaire_12_mois_q1?: number;
  salaire_12_mois_q2?: number;
  salaire_12_mois_q3?: number;
  salaire_12_mois_q2_q0?: number;
  salaire_12_mois_q2_q1?: number;
  salaire_12_mois_q2_q2?: number;
  salaire_12_mois_q2_q3?: number;
  salaire_12_mois_q2_q4?: number;
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
  indicateurPoursuiteAnneeCommune?: IndicateurPoursuiteAnneeCommune[];
  indicateurPoursuiteRegional?: IndicateurPoursuiteRegional;
};

export type MetierTransitionType = "transitionNumerique" | "transitionEcologique" | "transitionDemographique";

export type Metier = {
  id: string;
  rome: string;
  libelle: string;
  onisepLink?: string;
  onisepLibelle?: string;
  franceTravailLibelle?: string;
  franceTravailLink?: string;
  transitionNumerique: boolean;
  transitionEcologique: boolean;
  transitionEcologiqueDetaillee?: string;
  transitionDemographique: boolean;
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
  niveauDiplome?: string;
  codeRncp?: string;
  formationPoursuite?: FormationPoursuite[];
  indicateurPoursuite?: IndicateurPoursuiteNational;
  metier?: Metier[];
  isAnneeCommune?: boolean;
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
  statutDetail?: string;
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

  academie: string;
  region: string;
};

export type FormationFamilleMetierDetail = {
  formationEtablissement?: FormationEtablissement;
  formation: Formation;
  etablissement?: Etablissement;
};

export type FormationDetail = {
  formationEtablissement: FormationEtablissement;
  formation: Formation;
  etablissement: Etablissement;
  formationsFamilleMetier?: FormationFamilleMetierDetail[];
};

const formationEtablissementSchema = yup.object().concat(
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
    indicateurPoursuiteAnneeCommune: yup
      .array(
        yup.object({
          millesime: yup.string().required(),
          libelle: yup.string(),
          codeCertification: yup.string().required(),
          taux_en_emploi_6_mois: yup.number(),
          taux_en_formation: yup.number(),
          taux_autres_6_mois: yup.number(),
        })
      )
      .default(undefined),
    indicateurPoursuiteRegional: yup
      .object({
        millesime: yup.string().required(),
        region: yup.string().required(),
        voie: yup.string(),
        taux_en_formation_q0: yup.number().required(),
        taux_en_formation_q1: yup.number().required(),
        taux_en_formation_q2: yup.number().required(),
        taux_en_formation_q3: yup.number().required(),
        taux_en_formation_q4: yup.number().required(),
        taux_en_emploi_6_mois_q0: yup.number().required(),
        taux_en_emploi_6_mois_q1: yup.number().required(),
        taux_en_emploi_6_mois_q2: yup.number().required(),
        taux_en_emploi_6_mois_q3: yup.number().required(),
        taux_en_emploi_6_mois_q4: yup.number().required(),
      })
      .default(undefined),
  })
);

const formationSchema = yup.object().concat(
  yup.object().shape({
    id: yup.string().required(),
    cfd: yup.string().required(),
    libelle: yup.string(),
    voie: yup.string().oneOf(Object.values(FormationVoie)).required(),
  })
);

const etablissementSchema = yup.object().concat(
  yup.object().shape({
    id: yup.string().required(),
    uai: yup.string().required(),
    academie: yup.string().required(),
    region: yup.string().required(),
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
);

export const formationDetailSchema: yup.ObjectSchema<FormationDetail> = yup.object({
  formationEtablissement: formationEtablissementSchema.required(),
  formation: formationSchema.required(),
  etablissement: etablissementSchema.required(),
  formationsFamilleMetier: yup.array(
    yup.object({
      formationEtablissement: formationEtablissementSchema.default(undefined),
      formation: formationSchema.required(),
      etablissement: etablissementSchema.default(undefined),
    })
  ),
});
