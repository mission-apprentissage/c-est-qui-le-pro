import { FormationDetail, FormationFamilleMetierDetail } from "shared";
import { useSearchParams } from "next/navigation";

export const useFormationLink = ({
  formationDetail,
  longitude,
  latitude,
}: {
  formationDetail?: FormationDetail | FormationFamilleMetierDetail;
  longitude?: string;
  latitude?: string;
}) => {
  const searchParams = useSearchParams();
  const longitudeParams = longitude ?? searchParams.get("longitude");
  const latitudeParams = latitude ?? searchParams.get("latitude");

  if (!formationDetail || !formationDetail.etablissement) {
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
