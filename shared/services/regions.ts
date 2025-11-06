type Region = {
  code: string;
  code_region_academique: string;
  nom: string;
  departements: { code: string; nom: string; academie: string | null }[];
  academies: { code: string; prefix: string; nom: string }[];
};

export const REGIONS: Region[] = [
  {
    code: "00",
    code_region_academique: "00",
    nom: "Collectivités d'outre-mer",
    departements: [
      { code: "987", nom: "Polynésie Française", academie: "41" },
      { code: "988", nom: "Nouvelle-Calédonie", academie: "40" },
      { code: "989", nom: "Île de Clipperton", academie: null },
      { code: "984", nom: "Terres australes et antarctiques françaises", academie: null },
      { code: "986", nom: "Wallis et Futuna", academie: "42" },
      { code: "975", nom: "Saint-Pierre-et-Miquelon", academie: "44" },
      { code: "977", nom: "Saint-Barthélemy", academie: "77" },
      { code: "978", nom: "Saint-Martin", academie: "78" },
    ],
    academies: [
      { code: "40", prefix: "de ", nom: "Nouvelle-Calédonie" },
      { code: "42", prefix: "de ", nom: "Wallis et Futuna" },
      { code: "44", prefix: "de ", nom: "Saint-Pierre-et-Miquelon" },
      { code: "41", prefix: "de ", nom: "Polynésie Française" },
      { code: "77", prefix: "de ", nom: "Saint-Barthélemy" },
      { code: "78", prefix: "de ", nom: "Saint-Martin" },
    ],
  },
  {
    code: "01",
    code_region_academique: "07",
    nom: "Guadeloupe",
    departements: [{ code: "971", nom: "Guadeloupe", academie: "32" }],
    academies: [{ code: "32", prefix: "de ", nom: "Guadeloupe" }],
  },
  {
    code: "02",
    code_region_academique: "12",
    nom: "Martinique",
    departements: [{ code: "972", nom: "Martinique", academie: "31" }],
    academies: [{ code: "31", prefix: "de ", nom: "Martinique" }],
  },
  {
    code: "03",
    code_region_academique: "08",
    nom: "Guyane",
    departements: [{ code: "973", nom: "Guyane", academie: "33" }],
    academies: [{ code: "33", prefix: "de ", nom: "Guyane" }],
  },
  {
    code: "04",
    code_region_academique: "11",
    nom: "La Réunion",
    departements: [{ code: "974", nom: "La Réunion", academie: "28" }],
    academies: [{ code: "28", prefix: "de ", nom: "La Réunion" }],
  },
  {
    code: "06",
    code_region_academique: "13",
    nom: "Mayotte",
    departements: [{ code: "976", nom: "Mayotte", academie: "43" }],
    academies: [{ code: "43", prefix: "de ", nom: "Mayotte" }],
  },
  {
    code: "11",
    code_region_academique: "10",
    nom: "Île-de-France",
    departements: [
      { code: "75", nom: "Paris", academie: "01" },
      { code: "77", nom: "Seine-et-Marne", academie: "24" },
      { code: "78", nom: "Yvelines", academie: "25" },
      { code: "91", nom: "Essonne", academie: "25" },
      { code: "92", nom: "Hauts-de-Seine", academie: "25" },
      { code: "93", nom: "Seine-Saint-Denis", academie: "24" },
      { code: "94", nom: "Val-de-Marne", academie: "24" },
      { code: "95", nom: "Val-d'Oise", academie: "25" },
    ],
    academies: [
      { code: "01", prefix: "de ", nom: "Paris" },
      { code: "24", prefix: "de ", nom: "Créteil" },
      { code: "25", prefix: "de ", nom: "Versailles" },
    ],
  },
  {
    code: "24",
    code_region_academique: "04",
    nom: "Centre-Val de Loire",
    departements: [
      { code: "28", nom: "Eure-et-Loir", academie: "18" },
      { code: "36", nom: "Indre", academie: "18" },
      { code: "37", nom: "Indre-et-Loire", academie: "18" },
      { code: "41", nom: "Loir-et-Cher", academie: "18" },
      { code: "45", nom: "Loiret", academie: "18" },
      { code: "18", nom: "Cher", academie: "18" },
    ],
    academies: [{ code: "18", prefix: "d'", nom: "Orléans-Tours" }],
  },
  {
    code: "27",
    code_region_academique: "02",
    nom: "Bourgogne-Franche-Comté",
    departements: [
      { code: "70", nom: "Haute-Saône", academie: "03" },
      { code: "71", nom: "Saône-et-Loire", academie: "07" },
      { code: "89", nom: "Yonne", academie: "07" },
      { code: "90", nom: "Territoire de Belfort", academie: "03" },
      { code: "39", nom: "Jura", academie: "03" },
      { code: "21", nom: "Côte-d'Or", academie: "07" },
      { code: "25", nom: "Doubs", academie: "03" },
      { code: "58", nom: "Nièvre", academie: "07" },
    ],
    academies: [
      { code: "07", prefix: "de ", nom: "Dijon" },
      { code: "03", prefix: "de ", nom: "Besançon" },
    ],
  },
  {
    code: "28",
    code_region_academique: "14",
    nom: "Normandie",
    departements: [
      { code: "76", nom: "Seine-Maritime", academie: "70" },
      { code: "27", nom: "Eure", academie: "70" },
      { code: "50", nom: "Manche", academie: "70" },
      { code: "14", nom: "Calvados", academie: "70" },
      { code: "61", nom: "Orne", academie: "70" },
    ],
    academies: [{ code: "70", prefix: "de ", nom: "Normandie" }],
  },
  {
    code: "32",
    code_region_academique: "09",
    nom: "Hauts-de-France",
    departements: [
      { code: "80", nom: "Somme", academie: "20" },
      { code: "02", nom: "Aisne", academie: "20" },
      { code: "59", nom: "Nord", academie: "09" },
      { code: "60", nom: "Oise", academie: "20" },
      { code: "62", nom: "Pas-de-Calais", academie: "09" },
    ],
    academies: [
      { code: "20", prefix: "d'", nom: "Amiens" },
      { code: "09", prefix: "de ", nom: "Lille" },
    ],
  },
  {
    code: "44",
    code_region_academique: "06",
    nom: "Grand Est",
    departements: [
      { code: "88", nom: "Vosges", academie: "12" },
      { code: "08", nom: "Ardennes", academie: "19" },
      { code: "10", nom: "Aube", academie: "19" },
      { code: "51", nom: "Marne", academie: "19" },
      { code: "52", nom: "Haute-Marne", academie: "19" },
      { code: "54", nom: "Meurthe-et-Moselle", academie: "12" },
      { code: "55", nom: "Meuse", academie: "12" },
      { code: "57", nom: "Moselle", academie: "12" },
      { code: "67", nom: "Bas-Rhin", academie: "15" },
      { code: "68", nom: "Haut-Rhin", academie: "15" },
    ],
    academies: [
      { code: "19", prefix: "de ", nom: "Reims" },
      { code: "12", prefix: "de ", nom: "Nancy-Metz" },
      { code: "15", prefix: "de ", nom: "Strasbourg" },
    ],
  },
  {
    code: "52",
    code_region_academique: "17",
    nom: "Pays de la Loire",
    departements: [
      { code: "72", nom: "Sarthe", academie: "17" },
      { code: "85", nom: "Vendée", academie: "17" },
      { code: "44", nom: "Loire-Atlantique", academie: "17" },
      { code: "49", nom: "Maine-et-Loire", academie: "17" },
      { code: "53", nom: "Mayenne", academie: "17" },
    ],
    academies: [{ code: "17", prefix: "de ", nom: "Nantes" }],
  },
  {
    code: "53",
    code_region_academique: "03",
    nom: "Bretagne",
    departements: [
      { code: "29", nom: "Finistère", academie: "14" },
      { code: "35", nom: "Ille-et-Vilaine", academie: "14" },
      { code: "22", nom: "Côtes-d'Armor", academie: "14" },
      { code: "56", nom: "Morbihan", academie: "14" },
    ],
    academies: [{ code: "14", prefix: "de ", nom: "Rennes" }],
  },
  {
    code: "75",
    code_region_academique: "15",
    nom: "Nouvelle-Aquitaine",
    departements: [
      { code: "79", nom: "Deux-Sèvres", academie: "13" },
      { code: "86", nom: "Vienne", academie: "13" },
      { code: "87", nom: "Haute-Vienne", academie: "22" },
      { code: "33", nom: "Gironde", academie: "04" },
      { code: "40", nom: "Landes", academie: "04" },
      { code: "47", nom: "Lot-et-Garonne", academie: "04" },
      { code: "16", nom: "Charente", academie: "13" },
      { code: "17", nom: "Charente-Maritime", academie: "13" },
      { code: "19", nom: "Corrèze", academie: "22" },
      { code: "23", nom: "Creuse", academie: "22" },
      { code: "24", nom: "Dordogne", academie: "04" },
      { code: "64", nom: "Pyrénées-Atlantiques", academie: "04" },
    ],
    academies: [
      { code: "13", prefix: "de ", nom: "Poitiers" },
      { code: "22", prefix: "de ", nom: "Limoges" },
      { code: "04", prefix: "de ", nom: "Bordeaux" },
    ],
  },
  {
    code: "76",
    code_region_academique: "16",
    nom: "Occitanie",
    departements: [
      { code: "81", nom: "Tarn", academie: "16" },
      { code: "82", nom: "Tarn-et-Garonne", academie: "16" },
      { code: "30", nom: "Gard", academie: "11" },
      { code: "31", nom: "Haute-Garonne", academie: "16" },
      { code: "32", nom: "Gers", academie: "16" },
      { code: "34", nom: "Hérault", academie: "11" },
      { code: "46", nom: "Lot", academie: "16" },
      { code: "48", nom: "Lozère", academie: "11" },
      { code: "09", nom: "Ariège", academie: "16" },
      { code: "11", nom: "Aude", academie: "11" },
      { code: "12", nom: "Aveyron", academie: "16" },
      { code: "65", nom: "Hautes-Pyrénées", academie: "16" },
      { code: "66", nom: "Pyrénées-Orientales", academie: "11" },
    ],
    academies: [
      { code: "16", prefix: "de ", nom: "Toulouse" },
      { code: "11", prefix: "de ", nom: "Montpellier" },
    ],
  },
  {
    code: "84",
    code_region_academique: "01",
    nom: "Auvergne-Rhône-Alpes",
    departements: [
      { code: "73", nom: "Savoie", academie: "08" },
      { code: "74", nom: "Haute-Savoie", academie: "08" },
      { code: "26", nom: "Drôme", academie: "08" },
      { code: "38", nom: "Isère", academie: "08" },
      { code: "42", nom: "Loire", academie: "10" },
      { code: "43", nom: "Haute-Loire", academie: "06" },
      { code: "01", nom: "Ain", academie: "10" },
      { code: "03", nom: "Allier", academie: "06" },
      { code: "07", nom: "Ardèche", academie: "08" },
      { code: "15", nom: "Cantal", academie: "06" },
      { code: "63", nom: "Puy-de-Dôme", academie: "06" },
      { code: "69", nom: "Rhône", academie: "10" },
    ],
    academies: [
      { code: "10", prefix: "de ", nom: "Lyon" },
      { code: "06", prefix: "de ", nom: "Clermont-Ferrand" },
      { code: "08", prefix: "de ", nom: "Grenoble" },
    ],
  },
  {
    code: "93",
    code_region_academique: "18",
    nom: "Provence-Alpes-Côte d'Azur",
    departements: [
      { code: "83", nom: "Var", academie: "23" },
      { code: "84", nom: "Vaucluse", academie: "02" },
      { code: "04", nom: "Alpes-de-Haute-Provence", academie: "02" },
      { code: "05", nom: "Hautes-Alpes", academie: "02" },
      { code: "06", nom: "Alpes-Maritimes", academie: "23" },
      { code: "13", nom: "Bouches-du-Rhône", academie: "02" },
    ],
    academies: [
      { code: "02", prefix: "d'", nom: "Aix-Marseille" },
      { code: "23", prefix: "de ", nom: "Nice" },
    ],
  },
  {
    code: "94",
    code_region_academique: "05",
    nom: "Corse",
    departements: [
      { code: "20", nom: "Corse", academie: "27" },
      { code: "2A", nom: "Corse-du-Sud", academie: "27" },
      { code: "2B", nom: "Haute-Corse", academie: "27" },
    ],
    academies: [{ code: "27", prefix: "de ", nom: "Corse" }],
  },
];

export function findRegionByCode(code: string) {
  return REGIONS.find((region) => region.code === code) || null;
}

export function codePostalToDepartement(postcode: string): string {
  return postcode.match(/^(97|98)/) ? postcode.substring(0, 3) : postcode.substring(0, 2);
}

export function findRegionByCodePostal(postcode: string) {
  const departement = codePostalToDepartement(postcode);
  return REGIONS.find((region) => region.departements.find((d) => d.code == departement));
}

export function findAcademieByCode(code: string) {
  for (const region of REGIONS) {
    for (const academie of region.academies) {
      if (academie.code === code) {
        return academie;
      }
    }
  }

  return null;
}

export function findAcademieByPostcode(postcode: string): string | null {
  const departementCode = codePostalToDepartement(postcode);

  for (const region of REGIONS) {
    for (const departement of region.departements) {
      if (departement.code === departementCode) {
        return departement.academie;
      }
    }
  }

  return null;
}
