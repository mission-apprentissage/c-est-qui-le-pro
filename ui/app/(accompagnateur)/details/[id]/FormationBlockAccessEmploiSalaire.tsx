/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { DiplomeTypeLibelle, Formation } from "shared";
import Button from "#/app/components/Button";
import { BlockDivider } from "./FormationBlock.styled";
import DialogSalaireMedian, { modalSalaireMedian } from "#/app/(accompagnateur)/components/DialogSalaireMedian";
import DialogSalaireGlobal, { modalSalaireGlobal } from "../../components/DialogSalaireGlobal";
import { formatSalaire } from "#/app/utils/formation";
import {
  MarginBottomNegative,
  SalaryCenterBox,
  SalaryValueTypography,
  SalaryDistributionBar,
  SalaryDistributionInnerBar,
  WhiteTypography,
  FlexRowBox,
  FlexCenterWidth40Box,
  Width20Box,
  FlexRightBlueBox,
  SalaryPositionBox,
  FlexBox,
  FlexSpaceBetweenBox,
  SalaryGradientBar,
  FlexCenterColumnBox,
  BlueLink,
} from "./FormationBlockAccesEmploi.styled";

export function FormationSalaire({ formation }: { formation: Formation }) {
  if (
    !formation.indicateurPoursuite?.salaire_12_mois_q1 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q2 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q3
  ) {
    return;
  }

  return (
    <>
      <BlockDivider />
      <MarginBottomNegative>
        <Typography variant="h3">Pour cette formation, à quoi ressemble le salaire en début de carrière ?</Typography>
        <Typography variant="body4">
          <i className={fr.cx("ri-map-pin-2-line")}></i>
          Sur toute la France
        </Typography>
        <SalaryCenterBox>
          <SalaryValueTypography>
            {formatSalaire(formation.indicateurPoursuite.salaire_12_mois_q2)} €
          </SalaryValueTypography>
          <Typography variant="body4">salaire médian net / mois</Typography>
        </SalaryCenterBox>
        <Box>
          <SalaryDistributionBar>
            <SalaryDistributionInnerBar>
              <WhiteTypography variant="subtitle4">50% des salariés</WhiteTypography>
            </SalaryDistributionInnerBar>
          </SalaryDistributionBar>
          <FlexRowBox>
            <FlexCenterWidth40Box>
              <Typography variant="subtitle4">
                {formatSalaire(formation.indicateurPoursuite.salaire_12_mois_q1)} €
              </Typography>
            </FlexCenterWidth40Box>
            <Width20Box></Width20Box>
            <FlexCenterWidth40Box>
              <Typography variant="subtitle4">
                {formatSalaire(formation.indicateurPoursuite.salaire_12_mois_q3)} €
              </Typography>
            </FlexCenterWidth40Box>
          </FlexRowBox>
        </Box>

        <FlexRightBlueBox>
          <Button priority="tertiary no outline" {...modalSalaireMedian.buttonProps}>
            <Typography variant="subtitle4">En savoir plus ?</Typography>
          </Button>
        </FlexRightBlueBox>
      </MarginBottomNegative>
      <DialogSalaireMedian />
    </>
  );
}

export function FormationSalaireGlobal({ formation }: { formation: Formation }) {
  if (
    !formation.indicateurPoursuite?.salaire_12_mois_q2_q0 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q2 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q2_q4
  ) {
    return;
  }

  const position =
    (formation.indicateurPoursuite?.salaire_12_mois_q2 - formation.indicateurPoursuite?.salaire_12_mois_q2_q0) /
    (formation.indicateurPoursuite?.salaire_12_mois_q2_q4 - formation.indicateurPoursuite?.salaire_12_mois_q2_q0);

  return (
    <>
      <BlockDivider />
      <MarginBottomNegative>
        <Typography variant="h3">
          Où se situe ce salaire médian en début de carrière par rapport aux autres formations en{" "}
          {formation.niveauDiplome &&
            DiplomeTypeLibelle[formation.niveauDiplome] &&
            DiplomeTypeLibelle[formation.niveauDiplome]}
        </Typography>
        <Box>
          <FlexBox>
            <SalaryPositionBox positionSalary={position}>
              <Typography variant="subtitle4">
                {formatSalaire(formation.indicateurPoursuite?.salaire_12_mois_q2)}&nbsp;€
              </Typography>
            </SalaryPositionBox>
          </FlexBox>
          <FlexSpaceBetweenBox>
            <Typography variant="body3">Le salaire le plus bas</Typography>
            <Typography variant="body3">Le salaire le plus haut</Typography>
          </FlexSpaceBetweenBox>
          <SalaryGradientBar></SalaryGradientBar>
        </Box>
        <FlexRightBlueBox>
          <Button priority="tertiary no outline" {...modalSalaireGlobal.buttonProps}>
            <Typography variant="subtitle4">En savoir plus ?</Typography>
          </Button>
        </FlexRightBlueBox>
      </MarginBottomNegative>
      <DialogSalaireGlobal />
      <BlockDivider />
      <FlexCenterColumnBox>
        <Typography variant="body3">
          Données issues du dispositif{" "}
          <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
            InserJeunes
          </BlueLink>{" "}
          promotions {formation.indicateurPoursuite.millesimeSalaire}
        </Typography>
        <Typography variant="body3">
          <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
            D&apos;où viennent ces données ?
          </BlueLink>
        </Typography>
      </FlexCenterColumnBox>
    </>
  );
}
