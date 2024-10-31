import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Domaine {
  createdAt: Generated<Timestamp>;
  domaine: string;
  id: Generated<string>;
  sousDomaine: string;
  updatedAt: Generated<Timestamp>;
}

export interface Etablissement {
  academie: string | null;
  addressCedex: string | null;
  addressCity: string | null;
  addressPostCode: string | null;
  addressStreet: string | null;
  coordinate: string | null;
  createdAt: Generated<Timestamp>;
  hasFormation: boolean | null;
  id: Generated<string>;
  JPODetails: string | null;
  libelle: string | null;
  onisepId: string | null;
  region: Generated<string>;
  statut: string | null;
  statutDetail: string | null;
  uai: string;
  updatedAt: Generated<Timestamp>;
  url: string | null;
}

export interface EtablissementIsochrone {
  bucket: number;
  createdAt: Generated<Timestamp>;
  etablissementId: string;
  geom: string;
  id: Generated<string>;
  updatedAt: Generated<Timestamp>;
}

export interface EtablissementJPODate {
  createdAt: Generated<Timestamp>;
  details: string | null;
  etablissementId: string;
  from: Timestamp | null;
  fullDay: boolean | null;
  id: Generated<string>;
  to: Timestamp | null;
  updatedAt: Generated<Timestamp>;
}

export interface FamilleMetier {
  code: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  libelle: string;
  updatedAt: Generated<Timestamp>;
}

export interface Formation {
  cfd: string;
  codeDiplome: string | null;
  codeDispositif: string | null;
  codeRncp: string | null;
  createdAt: Generated<Timestamp>;
  description: string | null;
  descriptionAcces: string | null;
  descriptionPoursuiteEtudes: string | null;
  familleMetierId: string | null;
  id: Generated<string>;
  isAnneeCommune: boolean | null;
  libelle: string | null;
  mef11: string | null;
  niveauDiplome: Generated<string>;
  onisepIdentifiant: string | null;
  updatedAt: Generated<Timestamp>;
  voie: string;
}

export interface FormationDomaine {
  createdAt: Generated<Timestamp>;
  domaineId: string;
  formationId: string;
  updatedAt: Generated<Timestamp>;
}

export interface FormationEtablissement {
  createdAt: Generated<Timestamp>;
  duree: string | null;
  etablissementId: string;
  formationId: string;
  id: Generated<string>;
  millesime: string[] | null;
  tags: string[] | null;
  updatedAt: Generated<Timestamp>;
}

export interface FormationPoursuite {
  createdAt: Generated<Timestamp>;
  formationId: string;
  libelle: string;
  onisepId: string | null;
  type: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface FormationRome {
  createdAt: Generated<Timestamp>;
  formationId: string;
  rome: string;
  updatedAt: Generated<Timestamp>;
}

export interface FormationSimilaire {
  createdAt: Generated<Timestamp>;
  formationId: string;
  formationRelatedId: string;
  similarityOrder: number;
  updatedAt: Generated<Timestamp>;
}

export interface GeographyColumns {
  coord_dimension: number | null;
  f_geography_column: string | null;
  f_table_catalog: string | null;
  f_table_name: string | null;
  f_table_schema: string | null;
  srid: number | null;
  type: string | null;
}

export interface GeometryColumns {
  coord_dimension: number | null;
  f_geometry_column: string | null;
  f_table_catalog: string | null;
  f_table_name: string | null;
  f_table_schema: string | null;
  srid: number | null;
  type: string | null;
}

export interface IndicateurEntree {
  capacite: number | null;
  createdAt: Generated<Timestamp>;
  effectifs: number | null;
  formationEtablissementId: string | null;
  id: Generated<string>;
  premiersVoeux: number | null;
  rentreeScolaire: string | null;
  tauxPression: number | null;
  updatedAt: Generated<Timestamp>;
}

export interface IndicateurPoursuite {
  createdAt: Generated<Timestamp>;
  formationEtablissementId: string | null;
  id: Generated<string>;
  millesime: string | null;
  part_en_emploi_6_mois: string | null;
  taux_autres_6_mois: number | null;
  taux_en_emploi_6_mois: number | null;
  taux_en_formation: number | null;
  updatedAt: Generated<Timestamp>;
}

export interface IndicateurPoursuiteRegional {
  cfd: string;
  codeDispositif: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  millesime: string | null;
  part_en_emploi_6_mois: number | null;
  region: string;
  taux_autres_6_mois: number | null;
  taux_en_emploi_6_mois: number | null;
  taux_en_formation: number | null;
  updatedAt: Generated<Timestamp>;
  voie: string;
}

export interface Log {
  createdAt: Generated<Timestamp>;
  data: Json | null;
  id: Generated<string>;
  updatedAt: Generated<Timestamp>;
}

export interface Metric {
  cfd: string | null;
  cfds: string[] | null;
  consumer: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  time: Timestamp;
  uai: string | null;
  uais: string[] | null;
  updatedAt: Generated<Timestamp>;
  url: string;
}

export interface RawData {
  createdAt: Generated<Timestamp>;
  data: Json | null;
  id: Generated<string>;
  type: string;
  updatedAt: Generated<Timestamp>;
}

export interface Rome {
  createdAt: Generated<Timestamp>;
  rome: string;
  updatedAt: Generated<Timestamp>;
}

export interface RomeMetier {
  createdAt: Generated<Timestamp>;
  franceTravailLibelle: string | null;
  franceTravailLink: string | null;
  id: Generated<string>;
  libelle: string;
  onisepLibelle: string | null;
  onisepLink: string | null;
  rome: string;
  transitionDemographique: boolean;
  transitionEcologique: boolean;
  transitionEcologiqueDetaillee: string | null;
  transitionNumerique: boolean;
  updatedAt: Generated<Timestamp>;
}

export interface SpatialRefSys {
  auth_name: string | null;
  auth_srid: number | null;
  proj4text: string | null;
  srid: number;
  srtext: string | null;
}

export interface Test {
  test: string | null;
}

export interface DB {
  domaine: Domaine;
  etablissement: Etablissement;
  etablissementIsochrone: EtablissementIsochrone;
  etablissementJPODate: EtablissementJPODate;
  familleMetier: FamilleMetier;
  formation: Formation;
  formationDomaine: FormationDomaine;
  formationEtablissement: FormationEtablissement;
  formationPoursuite: FormationPoursuite;
  formationRome: FormationRome;
  formationSimilaire: FormationSimilaire;
  geography_columns: GeographyColumns;
  geometry_columns: GeometryColumns;
  indicateurEntree: IndicateurEntree;
  indicateurPoursuite: IndicateurPoursuite;
  indicateurPoursuiteRegional: IndicateurPoursuiteRegional;
  log: Log;
  metric: Metric;
  rawData: RawData;
  rome: Rome;
  romeMetier: RomeMetier;
  spatial_ref_sys: SpatialRefSys;
  test: Test;
}
