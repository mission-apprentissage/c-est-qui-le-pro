import * as yup from "yup";

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

export enum EtablissementType {
  INCONNU = "INCONNU",
  GRETA = "GRETA",
  AIDE = "AIDE",
  EREA = "EREA",
  LYC = "LYC",
  EXP = "EXP",
  CNED = "CNED",
  SGT = "SGT",
  SOC = "SOC",
  PBAC = "PBAC",
  HOSP = "HOSP",
  SEP = "SEP",
  CONT = "CONT",
  CFPA = "CFPA",
  LP = "LP",
  CFA = "CFA",
  TSGE = "TSGE",
  CLG = "CLG",
  EME = "EME",
}

export const EtablissementTypeFromValue = Object.fromEntries(
  Object.entries(EtablissementType).map(([key, value]) => [value, key as EtablissementType])
) as { [key: string]: EtablissementType };

export const EtablissementTypeLibellePrefix = {
  INCONNU: "cet",
  GRETA: "cet",
  AIDE: "cet",
  EREA: "cet",
  LYC: "ce",
  EXP: "cet",
  CNED: "cet",
  SGT: "cet",
  SOC: "cet",
  PBAC: "cet",
  HOSP: "cet",
  SEP: "cet",
  CONT: "cet",
  CFPA: "cet",
  LP: "ce",
  CFA: "ce",
  TSGE: "cet",
  CLG: "cet",
  EME: "cet",
};

export const EtablissementTypeLibelle: { [key in EtablissementType]: string } = {
  INCONNU: "établissement",
  GRETA: "établissement",
  AIDE: "établissement",
  EREA: "établissement",
  LYC: "lycée",
  EXP: "établissement",
  CNED: "établissement",
  SGT: "établissement",
  SOC: "établissement",
  PBAC: "établissement",
  HOSP: "établissement",
  SEP: "établissement",
  CONT: "établissement",
  CFPA: "établissement",
  LP: "lycée",
  CFA: "CFA",
  TSGE: "établissement", // Etablissement composé uniquement de STS et/ou de CPGE,
  CLG: "établissement",
  EME: "établissement",
};

export enum TransportModalite {
  SCOLAIRE = "scolaire",
  TRANSPORT = "transport",
}

export type Etablissement = {
  id: string;
  statut?: string;
  statutDetail?: string;
  type: keyof typeof EtablissementTypeLibelle;
  url?: string;
  libelle?: string;
  uai: string;
  onisepId?: string;

  JPODates?: JourneesPortesOuverteDate[] | null;
  JPODetails?: string | null;

  addressStreet?: string;
  addressPostCode?: string;
  addressCity?: string;
  latitude?: number;
  longitude?: number;
  accessTime?: number;
  formationCount?: number;
  niveauxDiplome?: string[];
  modalite?: TransportModalite;
  distance?: number;

  academie: string;
  region: string;
};

export const etablissementSchema: yup.ObjectSchema<Etablissement> = yup.object().concat(
  yup.object().shape({
    id: yup.string().required(),
    statut: yup.string(),
    statutDetail: yup.string(),
    type: yup
      .string()
      .transform((value) => (Object.values(EtablissementType).includes(value) ? value : EtablissementType.INCONNU))
      .oneOf(Object.values(EtablissementType))
      .required(),
    uai: yup.string().required(),
    academie: yup.string().required(),
    region: yup.string().required(),
    url: yup.string(),
    libelle: yup.string(),
    onisepId: yup.string(),
    addressStreet: yup.string(),
    addressPostCode: yup.string(),
    addressCity: yup.string(),
    latitude: yup.number(),
    longitude: yup.number(),
    accessTime: yup.number(),
    formationCount: yup.number(),
    niveauxDiplome: yup.array().of(yup.string().required()),
    modalite: yup.string().oneOf(Object.values(TransportModalite)),
    distance: yup.number(),
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
