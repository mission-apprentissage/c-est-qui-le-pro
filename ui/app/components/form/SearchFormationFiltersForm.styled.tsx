/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import Button from "../Button";
import { fr } from "@codegouvfr/react-dsfr";

export const MobileContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

export const MobileHeaderContainer = styled(Box)`
  display: flex;
  margin-left: 1rem;
  margin-right: 1rem;
  align-items: center;
`;

export const MobileHeaderTitle = styled(Typography)`
  text-align: center;
  flex: 1;
  margin: 0.5rem;
`;

export const MobileContentContainer = styled(Box)`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  overflow: scroll;
  display: flex;
  padding-bottom: 1rem;
  flex-direction: column;
`;

export const MobileSubtitle = styled(Typography)`
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

export const MobileFooter = styled(Box)`
  display: flex;
  padding: 1rem;
  padding-left: 2rem;
  padding-right: 2rem;
  align-items: center;
  justify-content: space-between;
`;

export const ClearButtonText = styled(Typography)`
  font-weight: 700;
`;

export const MobileFilterButtons = styled(Box)`
  display: flex;
  justify-content: flex-end;
  padding: 1rem;
  z-index: 999;
  background-color: white;
`;

export const FilterIcon = styled.i`
  padding-right: 0.5rem;

  &[class^="ri-"]::before {
    --icon-size: 1.2rem;
  }
`;

export const FilterButton = styled(Button, {
  shouldForwardProp: (prop) => !["hasFilter"].includes(prop as string),
})<{ hasFilter: boolean }>`
  position: relative;
  padding-top: 0rem;
  padding-bottom: 0rem;
  min-height: 2.25rem;
  ${({ hasFilter }) =>
    hasFilter ? `background-color: ${fr.colors.decisions.background.open.blueFrance.default};` : ""}

  &[class*=" ri-"]::before {
    --icon-size: 1.3rem;
  }
`;

export const FilterBadge = styled(Box)`
  position: absolute;
  width: 18px;
  height: 18px;
  right: -5px;
  top: -5px;
  background: #1212ff;
  border-radius: 9px;
  color: white;
  font-size: 0.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const FilterContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  flex-wrap: wrap;
  row-gap: 1rem;
  border: 1px solid #dddddd;
  box-shadow: 0 4px 4px -4px #00000040;
  padding: 1rem;
  padding-left: 2.5rem;
  padding-right: 2.5rem;
  padding-bottom: 1rem;
  z-index: 999;
`;

export const FilterContainerMobile = styled(Box)`
  display: flex;
  flex-direction: column;
`;
