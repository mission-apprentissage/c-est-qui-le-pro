import { FormationDetail, FormationFamilleMetierDetail } from "shared";
import { useSearchParams } from "next/navigation";

export function formationDetailToKey(formationDetail: FormationDetail | FormationFamilleMetierDetail) {
  if (!formationDetail || !formationDetail.etablissement) {
    return null;
  }

  return `${formationDetail.formation.cfd}-${formationDetail.formation.codeDispositif || ""}-${
    formationDetail.etablissement.uai
  }-${formationDetail.formation.voie}`;
}

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

  const key = formationDetailToKey(formationDetail);
  const parameters = new URLSearchParams({
    ...(latitudeParams ? { latitude: latitudeParams } : {}),
    ...(longitudeParams ? { longitude: longitudeParams } : {}),
  });

  return `/details/${key}?${parameters}`;
};
