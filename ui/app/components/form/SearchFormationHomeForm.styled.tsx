"use client";
import styled from "@emotion/styled";
import { Grid } from "#/app/components/MaterialUINext";
import Button, { ButtonProps } from "../Button";
import { Box, Stack } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

export const SubmitStyled = styled(Button, {
  shouldForwardProp: (prop) => !["isFocusMobile"].includes(prop),
})<ButtonProps & { isFocusMobile?: boolean }>`
  border-radius: 26px;
  width: 100%;
  background-color: var(--blue-france-sun-113-625-hover);
  font-size: 20px;
  line-height: 32px;
  justify-content: center;
  white-space: nowrap;
  --hover-tint: ${fr.colors.decisions.border.active.blueFrance.default};

  ${({ isFocusMobile }) => {
    return isFocusMobile
      ? `border-radius: 36px;
            padding: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;`
      : "";
  }}
`;

export const FormContainer = styled("div", {
  shouldForwardProp: (prop) => !["isFocusMobile"].includes(prop as string),
})<{ isFocusMobile?: boolean }>`
  flex: 1;
`;

export const SearchGridContainer = styled(Grid, {
  shouldForwardProp: (prop) => !["isBordered", "withFormation"].includes(prop as string),
})<{ isBordered?: boolean; withFormation?: boolean }>`
  background-color: #ffffff;
  ${({ isBordered, withFormation }) =>
    isBordered && !withFormation
      ? `
      border-radius: 50px; 
      border: 3px solid var(--blue-france-sun-113-625-hover);
    `
      : ""}
`;

export const FieldStack = styled(Stack, {
  shouldForwardProp: (prop) => !["isBordered", "isRounded"].includes(prop as string),
})<{ isBordered?: boolean; isRounded?: boolean }>`
  position: relative;
  background-color: #ffffff;
  ${({ isBordered, isRounded }) =>
    isBordered && !isRounded
      ? `
      border-radius: 5px; 
      border: 2px solid var(--blue-france-sun-113-625-hover);
    `
      : ""}

  ${({ isBordered, isRounded }) =>
    isBordered && isRounded
      ? `
      border-radius: 50px; 
    `
      : ""}
`;

export const DesktopSubmitBox = styled(Box)`
  width: 45%;
  padding: 18px;
  padding-left: 0;
  padding-right: 24px;
  display: none;

  ${({ theme }) => theme.breakpoints.up("md")} {
    display: block;
  }
`;

export const FormationSubmitBox = styled(Box)`
  width: 100%;
  padding-top: 18px;
  padding-bottom: 18px;
  display: block;
`;

export const MobileSubmitContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const OverlayContainer = styled("div", {
  shouldForwardProp: (prop) => !["isFocus"].includes(prop as string),
})<{ isFocus?: boolean }>`
  ${({ isFocus }) =>
    isFocus
      ? `
      height: 100vh; 
      background-color: white; 
      width: 100%;
    `
      : ""}
`;

export const OverlayInner = styled("div", {
  shouldForwardProp: (prop) => !["isFocus"].includes(prop as string),
})<{ isFocus?: boolean }>`
  ${({ isFocus }) =>
    isFocus
      ? `
      width: 100%;
      background-color: white;
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      z-index: 9999;
      padding: 1rem;
      display: flex;
      flex-flow: column;
    `
      : ""}
`;

export const MobileCloseButtonContainer = styled.div`
  margin-bottom: 1rem;
`;
