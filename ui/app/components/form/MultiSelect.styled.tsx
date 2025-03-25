/** @jsxImportSource @emotion/react */
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "../MaterialUINext";
import styled from "@emotion/styled";

export const StyledOptionLabel = styled("label", {
  shouldForwardProp: (prop) => !["paddingText"].includes(prop as string),
})<{ paddingText?: string }>`
  ${({ paddingText }) => `padding: ${paddingText} 0;`}
`;

export const StyledOptionBox = styled(Box, {
  shouldForwardProp: (prop) => !["hasIcon", "hasPictogramme"].includes(prop as string),
})<{ checked: boolean; hasPictogramme: boolean }>`
  border: 1px solid var(--border-default-grey);
  display: flex;
  flex-direction: row;
  padding-right: ${({ hasPictogramme }) => (hasPictogramme ? "1rem" : "1.5rem")};
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

  & input[type="checkbox"] + label {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  & input[type="checkbox"] + label::before {
    left: -2rem;
  }
`;

export const IconContainer = styled(Box, {
  shouldForwardProp: (prop) => !["hasIcon", "hasPictogramme", "withSeparator"].includes(prop as string),
})<{ hasIcon: boolean; hasPictogramme: boolean; withSeparator: boolean }>`
  margin-left: auto;
  padding: ${({ hasPictogramme }) => (hasPictogramme ? "0.5rem" : "1rem")};
  padding-left: ${({ hasPictogramme }) => (hasPictogramme ? "1rem" : "1.5rem")};
  padding-right: 0rem;
  position: relative;
  &:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 5%;
    height: 90%;
    width: 1px;
    ${({ hasIcon, hasPictogramme, withSeparator }) =>
      withSeparator && (hasIcon || hasPictogramme) && "border-left: 1px solid #dddddd;"}
  }
`;

export const EmptyIconSpace = styled(Box)`
  height: 2rem;
`;

export const SelectContainer = styled(Box)<{ width?: string }>`
  ${({ width }) => width && `width: ${width};`}
`;

export const SelectHeader = styled(Box, {
  shouldForwardProp: (prop) => !["isOpen", "hasValue"].includes(prop as string),
})<{ isOpen: boolean; hasValue: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 0.25rem;
  ${({ isOpen, hasValue }) =>
    (isOpen || hasValue) && `background-color: ${fr.colors.decisions.background.open.blueFrance.default};`}
  padding: 0.3rem 0.5rem;
  border: 1px solid #dddddd;

  &:hover {
    background-color: ${({ hasValue }) =>
      hasValue
        ? fr.colors.decisions.background.alt.blueFrance.default
        : fr.colors.decisions.background.open.blueFrance.default};
    border: 1px solid ${fr.colors.decisions.background.open.blueFrance.default};
    cursor: pointer;
  }

  & > i {
    color: ${fr.colors.decisions.border.actionHigh.blueFrance.default};
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
  shouldForwardProp: (prop) => !["isOpen", "widthDropdown"].includes(prop as string),
})<{ isOpen: boolean; widthDropdown?: string }>`
  box-shadow: 0px 6px 18px rgba(0, 0, 18, 0.16);
  width: ${({ widthDropdown }) => widthDropdown || "428px"};
  position: absolute;
  z-index: 999;
  background-color: #ffffff;
  display: ${({ isOpen }) => (isOpen ? "block" : "none")};
`;

export const OptionsContainer = styled(Box, {
  shouldForwardProp: (prop) => !["hasDescription"].includes(prop as string),
})<{ maxHeight?: string; hasDescription: boolean }>`
  ${({ maxHeight }) => maxHeight && `height: ${maxHeight}; overflow-y: scroll;`}

  padding: 2rem;
  ${({ hasDescription }) => (hasDescription ? "padding-top: 1rem;" : "")}

  & input[type="checkbox"] + label::before {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

export const ActionBar = styled(Box)`
  border-top: 1px solid #dddddd;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
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

export const DescriptionContainer = styled(Box)`
  margin: 0rem 2rem;
  margin-top: 2rem;
`;

export const DescriptionContainerMobile = styled(Box)`
  margin: 1rem 0rem;
`;
