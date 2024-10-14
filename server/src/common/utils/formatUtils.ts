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
