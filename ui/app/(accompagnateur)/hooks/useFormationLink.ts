import { FormationDetail } from "#/types/formation";
import { useSearchParams } from "next/navigation";
import { useFormationsSearch } from "../context/FormationsSearchContext";

export const useFormationLink = ({
  formationDetail,
  longitude,
  latitude,
}: {
  formationDetail?: FormationDetail;
  longitude?: string;
  latitude?: string;
}) => {
  const searchParams = useSearchParams();
  const longitudeParams = longitude ?? searchParams.get("longitude");
  const latitudeParams = latitude ?? searchParams.get("latitude");

  if (!formationDetail) {
    return null;
  }

  const key = `${formationDetail.formation.cfd}-${formationDetail.formation.codeDispositif || ""}-${
    formationDetail.etablissement.uai
  }-${formationDetail.formation.voie}`;
  const parameters = new URLSearchParams({
    ...(latitudeParams ? { latitude: latitudeParams } : {}),
    ...(longitudeParams ? { longitude: longitudeParams } : {}),
  });

  return `/details/${key}?${parameters}`;
};
