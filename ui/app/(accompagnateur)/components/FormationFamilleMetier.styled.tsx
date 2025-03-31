/** @jsxImportSource @emotion/react */
import { Box, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import "moment/locale/fr";
import styled from "@emotion/styled";
import Card from "#/app/components/Card";

export const StyledFormationFamilleMetierCard = styled(Card)<{ disableHover: boolean }>`
  &.MuiButtonBase-root:hover {
    ${(props) =>
      props.disableHover
        ? "background-color: white;"
        : `background-color: ${fr.colors.decisions.background.actionLow.blueFrance.default};`}
  }

  &.MuiButtonBase-root {
    ${(props) =>
      props.disableHover ? "" : `background-color: ${fr.colors.decisions.background.alt.blueFrance.default};`}
    height: 100%;
  }

  & > .MuiBox-root {
    width: 100%;
    height: 100%;
  }

  & > .MuiBox-root > .MuiContainer-root {
    padding: 1.25rem;
    padding-left: 2.25rem;
    position: relative;
    display: flex;
    height: 100%;
    width: 100%;
    flex-direction: column;
    justify-content: space-between;
  }

  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;

export const StatusIndicator = styled("div", {
  shouldForwardProp: (prop) => !["available"].includes(prop as string),
})<{ available: boolean }>`
  width: 8px;
  height: 8px;
  left: 1rem;
  border-radius: 4px;
  background: ${(props) => (props.available ? "#2fc368" : "#FF6218")};
  position: absolute;
`;

export const ActionContainer = styled(Box)`
  margin-top: 1rem;
`;

export const FormationTitle = styled(Typography, {
  shouldForwardProp: (prop) => !["available"].includes(prop as string),
})<{ available?: boolean }>`
  color: ${(props) => (props.available ? fr.colors.decisions.artwork.major.blueFrance.default : "inherit")};
`;

export const ArrowIcon = styled.i`
  color: ${fr.colors.decisions.artwork.major.blueFrance.default};
`;

export const FormationListItem = styled("li", {
  shouldForwardProp: (prop) => !["available"].includes(prop as string),
})<{ available?: boolean }>`
  &::marker {
    color: ${(props) =>
      props.available ? fr.colors.options.success._425_625.active : fr.colors.options.warning._425_625.active};
  }
  margin-left: 0.6rem;
  ${(props) =>
    props.available &&
    `
    color: ${fr.colors.decisions.artwork.major.blueFrance.default};
    font-weight: 700;
  `}
`;

export const FormationList = styled("ul", {
  shouldForwardProp: (prop) => !["small"].includes(prop as string),
})<{ small?: boolean }>`
  margin: 0;
  & li {
    font-size: ${(props) => (props.small ? "1rem" : "1.125rem")};
    line-height: ${(props) => (props.small ? "1.5rem" : "1.75rem")};
    padding-bottom: 0;
  }

  & li:not(:last-child) {
    margin-bottom: ${(props) => (props.small ? "0.25rem" : "0.25rem")};
  }
`;

export const FormationContainer = styled(Box, {
  shouldForwardProp: (prop) => !["small"].includes(prop as string),
})<{ small?: boolean }>`
  background-color: ${fr.colors.decisions.background.alt.blueFrance.default};
  padding: 1rem 0.75rem;
  border-radius: 9px;
`;

export const FormationTitle2 = styled(Typography, {
  shouldForwardProp: (prop) => !["small"].includes(prop as string),
})<{ small?: boolean }>`
  font-size: ${(props) => (props.small ? "0.875rem" : "1rem")};
  font-weight: 500;
  padding-bottom: ${(props) => (props.small ? "0.25rem" : "0.5rem")};
`;

export const SectionTitle = styled(Typography, {
  shouldForwardProp: (prop) => !["hasMargin"].includes(prop as string),
})<{ hasMargin?: boolean }>`
  margin-bottom: 1.5rem;
  margin-top: ${(props) => (props.hasMargin ? "2.5rem" : "0rem")};
`;
