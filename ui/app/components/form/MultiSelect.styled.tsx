/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "../MaterialUINext";
import styled from "@emotion/styled";

export const StyledOptionBox = styled(Box, {
  shouldForwardProp: (prop) => !["hasIcon"].includes(prop as string),
})<{ checked: boolean }>`
  border: ${({ checked }) =>
    checked ? "1px solid var(--border-active-blue-france)" : "1px solid var(--border-default-grey)"};
  display: flex;
  flex-direction: row;
  padding-right: 1.5rem;
  padding-left: 3rem;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.5rem;
  cursor: pointer;

  &:hover {
    background-color: var(--grey-1000-50-hover);
  }
`;

export const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => !["hasIcon"].includes(prop as string),
})<{ hasIcon: boolean }>`
  margin-left: auto;
  padding: 1rem;
  padding-left: 1.5rem;
  padding-right: 0rem;
  position: relative;
  &:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 5%;
    height: 90%;
    width: 1px;
    ${({ hasIcon }) => hasIcon && "border-left: 1px solid #dddddd;"}
  }
`;

export const EmptyIconSpace = styled(Box)`
  height: 2rem;
`;

export const SelectContainer = styled(Box)<{ width?: string }>`
  ${({ width }) => width && `width: ${width};`}
`;

export const SelectHeader = styled(Box, {
  shouldForwardProp: (prop) => !["isOpen"].includes(prop as string),
})<{ isOpen: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  ${({ isOpen }) => isOpen && `background-color: ${fr.colors.decisions.background.open.blueFrance.default};`}
  padding: 0.5rem;
  border: 1px solid #dddddd;

  &:hover {
    background-color: ${fr.colors.decisions.background.open.blueFrance.default};
    cursor: pointer;
  }
`;

export const LabelText = styled(Typography)`
  color: ${fr.colors.decisions.background.actionHigh.blueFrance.default};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex-grow: 1;
`;

export const DropdownMenu = styled(Box, {
  shouldForwardProp: (prop) => !["isOpen"].includes(prop as string),
})<{ isOpen: boolean }>`
  box-shadow: 0px 6px 18px rgba(0, 0, 18, 0.16);
  width: 412px;
  position: absolute;
  z-index: 999;
  background-color: #ffffff;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
  padding: 2rem;
`;

export const OptionsContainer = styled(Box)<{ maxHeight?: string }>`
  ${({ maxHeight }) => maxHeight && `height: ${maxHeight}; overflow-y: scroll;`}
`;

export const ActionBar = styled(Box)`
  border-top: 1px solid #dddddd;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
`;

export const ClearButtonText = styled(Typography)`
  font-weight: 700;
`;

export const MobileContainer = styled(Box)`
  width: 100%;
`;

export const ShowMoreText = styled(Typography)`
  margin-top: 1rem;
  color: var(--text-title-grey);
`;
