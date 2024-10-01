import RawDataRepository, { RawData, RawDataType } from "#src/common/repositories/rawData";

export async function cfdsParentAndChildren(cfd) {
  const cfds = [cfd];

  const diplomeBCNBase = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: cfd }))
    ?.data as RawData[RawDataType.BCN];
  if (!diplomeBCNBase) {
    return cfds;
  }

  let diplomeBCN = diplomeBCNBase;
  let parents = diplomeBCN.ancien_diplome;
  // Support only 1 to 1 case
  while (parents && parents.length == 1) {
    cfds.push(parents[0]);
    diplomeBCN = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: parents[0] }))
      ?.data as RawData[RawDataType.BCN];

    parents = diplomeBCN?.ancien_diplome;
  }

  diplomeBCN = diplomeBCNBase;
  let children = diplomeBCN.nouveau_diplome;
  // Support only 1 to 1 case
  while (children && children.length == 1) {
    cfds.push(children[0]);
    diplomeBCN = (await RawDataRepository.firstForType(RawDataType.BCN, { code_certification: children[0] }))
      ?.data as RawData[RawDataType.BCN];

    children = diplomeBCN?.nouveau_diplome;
  }

  return cfds;
}
