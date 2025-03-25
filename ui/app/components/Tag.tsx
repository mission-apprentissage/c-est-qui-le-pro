"use client";
import styled from "@emotion/styled";
import Tag, { TagProps as DSFRBTagProps } from "@codegouvfr/react-dsfr/Tag";
import { fr } from "@codegouvfr/react-dsfr";

type Level = "unknow" | "easy" | "average" | "hard";

export type TagProps = {
  variant?: "button-white" | "yellow" | "grey" | "purple-light" | "blue" | "filter" | "dark-blue" | "purple";
  active?: boolean;
  level?: Level;
  square?: boolean;
  bold?: boolean | string;
} & DSFRBTagProps;

// TODO: fix css order
const TagStyled = styled(Tag, {
  shouldForwardProp: (prop) => !["variant", "square", "level", "active", "bold"].includes(prop),
})<TagProps>`
  &,
  &.fr-tag {
    ${({ level }: { level?: Level }) => {
      const colors = { unknow: "#eeeeee", easy: "#B8FEC9", average: "#fceeac", hard: "#FED7D7" };
      return level ? `background-color: ${colors[level]}` : "";
    }}

    ${({ variant, active }) => {
      switch (variant) {
        case "button-white":
          return `
          background-color: var(--grey-1000-50);
          color: var(--blue-france-sun-113-625);
          border: 1px solid #ECECFE;
          
          &:not(:disabled):hover {
            background-color: var(--background-default-grey-hover);
          }`;
        case "yellow":
          return `background-color: #FEECC2;
          color: #716043;`;
        case "grey":
          return `color: #3A3A3A;`;
        case "purple-light":
          return `background-color: #F5F5FE;`;
        case "blue":
          return `background-color: var(--info-975-75);
           color: var(--info-425-625);`;
        case "dark-blue":
          return `background-color: ${fr.colors.decisions.background.alt.blueFrance.default};
             color: ${fr.colors.decisions.text.title.blueFrance.default};`;
        case "purple":
          return `background-color: var(--blue-france-925-125); color: var(--blue-france-sun-113-625);`;
        case "filter":
          return `
          background-color: var(--grey-1000-50);
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          padding-left: 1rem;
          padding-right: 1rem;
          color: ${fr.colors.decisions.text.default.grey.default};
          
          &:not(:disabled):hover {
            background-color: ${fr.colors.decisions.background.contrast.info.default};
            color: ${fr.colors.decisions.text.title.blueFrance.default};
          }
            
          ${
            active
              ? `
              background-color: ${fr.colors.decisions.background.actionLow.blueFrance.default};
              color: ${fr.colors.decisions.text.title.blueFrance.default};`
              : ""
          }

           &:not(:disabled):active {
            background-color: ${fr.colors.decisions.background.actionLow.blueFrance.default};
            color: ${fr.colors.decisions.text.title.blueFrance.default};
          }
            `;
        default:
          return "";
      }
    }};

    ${({ square }) => {
      return square ? `border-radius: 4px;` : "";
    }}

    ${({ bold }) => (bold ? (bold === true ? "font-weight: 700;" : `font-weight: ${bold};`) : "")}
  }
`;

export const TagStatutPublic = styled(TagStyled)`
  background-color: var(--info-950-100);
  color: var(--blue-france-sun-113-625);
`;

export const TagDiplome = styled(TagStyled)`
  background-color: #f4f5fe;
  font-weight: 500;
`;

export const TagStatutPrive = styled(TagStyled)`
  background-color: #feebcb;
  color: #7b341e;
`;

export const TagDuree = styled(TagStyled)`
  background-color: var(--info-950-100);
  color: var(--info-425-625);
`;

export const TagApprentissage = styled(TagStyled)`
  color: ${fr.colors.decisions.text.default.success.default};
  background-color: ${fr.colors.options.greenMenthe._975_75.default};
`;

export default TagStyled;
