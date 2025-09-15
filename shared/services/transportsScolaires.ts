type OperateurTransportScolaire = {
  codeRegion: string;
  url: string | null;
};

export const OPERATEURS_TRANSPORTS_SCOLAIRES: OperateurTransportScolaire[] = [
  {
    codeRegion: "84",
    url: "https://www.laregionvoustransporte.fr/contenus/scolaire-tous-les-departements",
  },
  {
    codeRegion: "27",
    url: "https://www.bourgognefranchecomte.fr/accueil-transport",
  },
  {
    codeRegion: "53",
    url: "https://www.breizhgo.bzh/transport-scolaire",
  },
  {
    codeRegion: "24",
    url: "https://www.remi-centrevaldeloire.fr/transports-scolaires/horaires-lignes-scolaires/",
  },
  {
    codeRegion: "94",
    url: "https://www.isula.corsica/transports-scolaires/",
  },
  {
    codeRegion: "44",
    url: "https://www.fluo.grandest.fr/scolaire/",
  },
  {
    codeRegion: "32",
    url: "https://www.hautsdefrance-mobilites.fr/se-deplacer/transport-scolaire/",
  },
  { codeRegion: "11", url: "https://www.iledefrance-mobilites.fr/transports-scolaires" },
  {
    codeRegion: "28",
    url: "https://nomad.normandie.fr/le-transport-scolaire-0",
  },
  {
    codeRegion: "75",
    url: "https://transports.nouvelle-aquitaine.fr/transports-scolaires",
  },
  { codeRegion: "76", url: "https://www.lio-occitanie.fr/transport-scolaire" },
  {
    codeRegion: "52",
    url: "https://aleop.paysdelaloire.fr/aleop-je-minforme-sur-les-transports-scolaires",
  },
  {
    codeRegion: "93",
    url: "https://zou.maregionsud.fr/",
  },
  {
    codeRegion: "01",
    url: null,
  },
  {
    codeRegion: "02",
    url: "https://www.martiniquetransport.mq/transport-scolaire/",
  },
  {
    codeRegion: "03",
    url: "https://www.ctguyane.fr/direction-des-transports/",
  },
  {
    codeRegion: "04",
    url: null,
  },
  {
    codeRegion: "06",
    url: "https://www.halo.yt/",
  },
];

export function findOperateurByCode(codeRegion: string) {
  return OPERATEURS_TRANSPORTS_SCOLAIRES.find((transport) => transport.codeRegion === codeRegion) || null;
}
