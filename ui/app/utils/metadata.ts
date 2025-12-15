import { SearchFormationFormData } from "../components/form/SearchFormationForm";
import { FORMATION_TAG } from "../services/formation";

export function getFiltersString({
  tag,
  domaines,
  voie,
  diplome,
  recherche,
}: Pick<SearchFormationFormData, "tag" | "domaines" | "voie" | "diplome" | "recherche">): string {
  const filters = [
    ...(recherche ? [recherche] : []),
    ...(diplome?.length ? diplome : []),
    ...(voie?.length ? voie : []),
    ...(tag?.length ? tag.map((tag) => FORMATION_TAG.find((t) => t.tag === tag)?.libelle) : []),
    ...(domaines?.length ? domaines : []),
  ];
  return filters.join(" ; ");
}
