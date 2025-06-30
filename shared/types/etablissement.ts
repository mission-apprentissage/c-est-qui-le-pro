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

export const EtablissementTypeLibelle: { [key in EtablissementType]: string } = {
  INCONNU: "établissement",
  GRETA: "GRETA",
  AIDE: "groupe d'aide psycho-pédagogique",
  EREA: "lycée d'enseignement adapté",
  LYC: "lycée",
  EXP: "établissement expérimental du second degré",
  CNED: "centre d'enseignement à distance",
  SGT: "section d'enseignement général ou technologique",
  SOC: "maison d'enfants à caractère social",
  PBAC: "école de formation sanitaire et sociale",
  HOSP: "maison d'enfants à caractère sanitaire",
  SEP: "section d'enseignement professionnel",
  CONT: "établissement de formation continue",
  CFPA: "maison familiale rurale d'éducation et d'orientation",
  LP: "lycée",
  CFA: "CFA",
  TSGE: "établissement", // Etablissement composé uniquement de STS et/ou de CPGE,
  CLG: "collège",
  EME: "institut médico-éducatif",
};

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
