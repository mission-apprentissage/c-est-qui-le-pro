import RawDataRepository, { RawDataType } from "#src/common/repositories/rawData";

export async function isAnneeCommune(cfd) {
  // On considère qu'une formation est une année commune si :
  // Pour un code formation diplome :
  // - Elle n'a qu'un mefstat11 avec annee_dispositif = 1
  // - Elle n'a pas de mefstat11 avec annee_dispositif = 2 ou annee_dispositif = 3
  const formations = await RawDataRepository.search(
    RawDataType.BCN_MEF,
    {
      formation_diplome: cfd,
    },
    false
  );
  const formationsAnnee1 = formations.map((f) => f?.data).filter((f) => f.annee_dispositif === "1");
  return formationsAnnee1.length > 0 && formations.length === formationsAnnee1.length;
}
