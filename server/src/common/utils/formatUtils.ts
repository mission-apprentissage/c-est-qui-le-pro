import diacritics from "diacritics";
import { DiplomeSynonyms } from "shared";

export function formatLibelle(libelle: string): string {
  const diplomes = [
    "BEI",
    "BEP",
    "BEPA",
    "BMA",
    "BP",
    "BPA",
    "BP JEPS",
    "BT",
    "BTA",
    "BTS",
    "BTSA",
    "CAP",
    "CAPA",
    "CIPPA",
    "CPAP",
    "CPGE",
    "CP JEPS",
    "CS",
    "CSA",
    "DAEU",
    "DECF",
    "DE JEPS",
    "DEM",
    "DES JEPS",
    "DEUG",
    "DEUST",
    "DMA",
    "DUT",
    "FCIL",
    "FC",
    "MC",
    "MN",
    "TH",
  ];
  const regex = new RegExp(`\\b(${diplomes.join("|")})\\b`, "gi");
  return (
    libelle
      .toLowerCase()
      .replace(regex, function (v) {
        return v.toUpperCase();
      })
      // Special case for DU word
      .replace(/^DU/gi, "DU")
      .replace(/DU$/gi, "DU")
      .replace("2de", "seconde")
  );
}

export function formatUrl(url: string | null): string | null {
  if (!url) {
    return null;
  }

  const urlTrimed = url.trim();
  if (!urlTrimed.match(/^http(s)?:\/\//)) {
    return "https://" + urlTrimed;
  }
  return urlTrimed;
}

export function cleanString(value) {
  if (!value) {
    return value;
  }

  return diacritics.remove(value.replace(/\s+/g, " ").trim()).toLowerCase();
}

export function parseSearchQuery(str: string) {
  if (!str) {
    return null;
  }

  const diplome = new Set();
  let query = cleanString(str);
  for (const [diplomeType, words] of Object.entries(DiplomeSynonyms)) {
    const queryClean = query
      .replace(new RegExp(`\\b(${words.join("|")})\\b`, "g"), "")
      .replace(/\s+/g, " ")
      .trim();

    if (queryClean !== query) {
      diplome.add(diplomeType);
      query = queryClean;
    }
  }

  return { query: query, diplome: Array.from(diplome) };
}
