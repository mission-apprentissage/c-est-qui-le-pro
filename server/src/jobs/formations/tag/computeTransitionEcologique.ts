import { FormationTag } from "shared";
import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

export async function computeTransitionEcologique(formationEtablissement) {
  if (!formationEtablissement.formation.formacode) {
    return [];
  }

  const transitionData = await RawDataRepository.firstForType(RawDataType.RCO_formacodeTransitionEco, {
    "Code Formacode® V14": formationEtablissement.formation.formacode,
  });

  if (!transitionData) {
    return [];
  }

  return [FormationTag.TRANSITION_ECOLOGIQUE];
}
