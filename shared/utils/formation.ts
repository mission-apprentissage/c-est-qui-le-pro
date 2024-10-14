import { DiplomeType } from "../types/formation";
import { Entries } from "./tsUtils";

export function getDiplomeType(niveauDiplome: string) {
  const entry = (Object.entries(DiplomeType) as Entries<typeof DiplomeType>).find(([type, codes]) =>
    codes.includes(niveauDiplome)
  );

  return entry ? entry[0] : null;
}
