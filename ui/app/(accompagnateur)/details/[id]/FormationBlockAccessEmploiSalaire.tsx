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
  SalaryMedianBox,
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
  SalaryEnsembleBox,
} from "./FormationBlockAccesEmploi.styled";
import { css } from "@emotion/react";
import { getColorAtPosition } from "#/app/utils/color";
import { createPortal } from "react-dom";

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
        <Box>
          <Typography
            variant="h3"
            css={css`
              margin-bottom: 16px;
            `}
          >
            À quoi ressemble le salaire en début de carrière ?
          </Typography>
          <Typography variant="body4">
            <i
              style={{
                marginRight: "4px",
              }}
              className={fr.cx("ri-map-pin-2-line")}
            ></i>
            Sur toute la France
          </Typography>
        </Box>
        <SalaryMedianBox>
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
        </SalaryMedianBox>

        <FlexRightBlueBox>
          <Button priority="tertiary no outline" onClick={modalSalaireMedian.open}>
            <Typography variant="subtitle4">En savoir plus ?</Typography>
          </Button>
        </FlexRightBlueBox>
      </MarginBottomNegative>
      {createPortal(<DialogSalaireMedian />, document.body)}
    </>
  );
}

export function FormationSalaireGlobal({ formation }: { formation: Formation }) {
  const gradient = "linear-gradient(90deg, #0063cb 0%, #178b8a 57%, #28a959 99.5%)";

  if (
    !formation.indicateurPoursuite?.salaire_12_mois_q2_q0 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q2 ||
    !formation.indicateurPoursuite?.salaire_12_mois_q2_q4
  ) {
    return;
  }

  const extremum = Math.min(
    Math.max(formation.indicateurPoursuite?.salaire_12_mois_q2, formation.indicateurPoursuite?.salaire_12_mois_q2_q0),
    formation.indicateurPoursuite?.salaire_12_mois_q2_q4
  );
  const position =
    (extremum - formation.indicateurPoursuite?.salaire_12_mois_q2_q0) /
    (formation.indicateurPoursuite?.salaire_12_mois_q2_q4 - formation.indicateurPoursuite?.salaire_12_mois_q2_q0);

  return (
    <>
      <BlockDivider />
      <MarginBottomNegative>
        <Typography variant="h3">
          Où se situe ce salaire par rapport aux autres salaires en{" "}
          {formation.niveauDiplome &&
            DiplomeTypeLibelle[formation.niveauDiplome] &&
            DiplomeTypeLibelle[formation.niveauDiplome]}{" "}
          ?
        </Typography>
        <SalaryEnsembleBox>
          <FlexBox>
            <SalaryPositionBox positionSalary={position} bubbleColor={getColorAtPosition(gradient, position)}>
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
        </SalaryEnsembleBox>
        <FlexRightBlueBox>
          <Button priority="tertiary no outline" onClick={modalSalaireGlobal.open}>
            <Typography variant="subtitle4">En savoir plus ?</Typography>
          </Button>
        </FlexRightBlueBox>
      </MarginBottomNegative>
      {createPortal(<DialogSalaireGlobal />, document.body)}
      <BlockDivider />
      <FlexCenterColumnBox>
        <Typography variant="body3">
          Données issues du dispositif{" "}
          <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
            InserJeunes
          </BlueLink>{" "}
          promotion {formation.indicateurPoursuite.millesimeSalaire}.{" "}
          <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
            D&apos;où viennent ces données ?
          </BlueLink>
        </Typography>
      </FlexCenterColumnBox>
    </>
  );
}
