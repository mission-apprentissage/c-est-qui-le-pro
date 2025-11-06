"use client";
import styled from "@emotion/styled";
import Button, { ButtonProps as DSFRButtonProps } from "@codegouvfr/react-dsfr/Button";
import { isString } from "lodash-es";
import { fr } from "@codegouvfr/react-dsfr";

export type ButtonProps = {
  rounded?: boolean | string;
  variant?: "white" | "white-black" | "blue-france" | "blue-france-hover" | "blue-france-alt" | "black";
  smallIconOnly?: boolean;
  iconOnly?: boolean;
  iconSize?: "sm" | "md" | "lg";
  noMinHeight?: boolean;
} & DSFRButtonProps;

function ButtonBase({ children, smallIconOnly, ...props }: ButtonProps) {
  return (
    <Button {...props}>
      <div>{children}</div>
    </Button>
  );
}

export default styled(ButtonBase, {
  shouldForwardProp: (prop) => !["iconOnly", "iconSize", "rounded", "variant", "noMinHeight"].includes(prop),
})<ButtonProps>`
  ${({ rounded }) => (rounded ? (isString(rounded) ? `border-radius: ${rounded};` : "border-radius: 16px;") : "")}
  ${({ variant }) => {
    switch (variant) {
      case "white":
        return `background-color: var(--grey-1000-50);
        color: ${fr.colors.decisions.background.actionHigh.blueFrance.hover};
        padding: 1rem;
        padding-top: 0.625rem;
        padding-bottom: 0.625rem;
        font-weight: 700;`;
      case "white-black":
        return `
        background-color: var(--grey-1000-50);
        color: #000000;
        border-color: #000000;
        box-shadow: inset 0 0 0 1px #000000;
        padding: 16px;
        `;
      case "blue-france-hover":
        return `background-color: ${fr.colors.decisions.background.actionHigh.blueFrance.hover};
        --hover-tint: ${fr.colors.decisions.background.altOverlap.grey.default};`;
      case "black":
        return `
        color: #000000;
        `;
      case "blue-france-alt":
        return `
        color: ${fr.colors.decisions.artwork.major.blueFrance.default};
        background-color: ${fr.colors.decisions.background.alt.blueFrance.default};
         --hover-tint: ${fr.colors.decisions.background.actionLow.blueFrance.default};
         --active-tint: ${fr.colors.decisions.background.actionLow.blueFrance.default};
        `;
      case "blue-france":
        return `
        color: ${fr.colors.decisions.background.flat.info.default};
        background-color: none;
         --hover-tint: ${fr.colors.decisions.background.altOverlap.grey.default};;
         --active-tint: ${fr.colors.decisions.background.altOverlap.grey.default};;
        `;
      default:
        return "";
    }
  }};
  ${({ smallIconOnly, theme }) => {
    return smallIconOnly
      ? `${theme.breakpoints.down("md")} {
        &[class^=fr-icon-]::before, &[class*=" fr-icon-"]::before, &[class^=fr-fi-]::before, &[class*=" fr-fi-"]::before {
          margin-right: auto;
          margin-left: auto;
       }

       & > div {
        display: none;
       }
      }`
      : "";
  }}

  ${({ iconOnly }) => {
    return iconOnly
      ? `
      &.fr-btn--lg.fr-btn--icon-left[class^=fr-icon-]::before,
      &.fr-btn--lg.fr-btn--icon-left[class*=" fr-icon-"]::before,
      &.fr-btn--lg.fr-btn--icon-left[class^=fr-fi-]::before,
      &.fr-btn--lg.fr-btn--icon-left[class*=" fr-fi-"]::before,
      &[class^=fr-icon-]::before, &[class*=" fr-icon-"]::before,
      &[class^=fr-fi-]::before, &[class*=" fr-fi-"]::before,
      &.fr-btn--sm.fr-btn--icon-left[class*=" ri-"]::before{
          margin-right: 0;
          margin-left: 0;
      }

      padding: 0.25rem;
      border-radius: 1rem;
      min-height: 0;
    `
      : "";
  }}

  ${({ iconSize }) => {
    const iconSizes = { lg: "1.5rem", md: "1rem", sm: "0.75rem" };
    return iconSize
      ? `
      &.fr-btn--icon-left[class^=ri-]::before, &.fr-btn--icon-left[class*=" ri-"]::before, &.fr-btn--icon-left[class^=fr-fi-]::before, &.fr-btn--icon-left[class*=" fr-fi-"]::before {
        --icon-size: ${iconSizes[iconSize]};
      }`
      : ``;
  }}

  ${({ noMinHeight }) =>
    noMinHeight
      ? `
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    min-height: 0;`
      : ""}
`;
