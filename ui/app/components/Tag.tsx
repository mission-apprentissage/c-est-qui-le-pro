"use client";
import styled from "@emotion/styled";
import Tag, { TagProps as DSFRBTagProps } from "@codegouvfr/react-dsfr/Tag";

type Level = "unknow" | "easy" | "average" | "hard";

export type TagProps = {
  variant?: "button-white" | "yellow" | "grey" | "purple-light" | "blue";
  level?: Level;
  square?: boolean;
} & DSFRBTagProps;

// TODO: fix css order
const TagStyled = styled(Tag, {
  shouldForwardProp: (prop) => !["variant", "square", "level"].includes(prop),
})<TagProps>`
  &,
  &.fr-tag {
    ${({ level }: { level?: Level }) => {
      const colors = { unknow: "#eeeeee", easy: "#B8FEC9", average: "#fceeac", hard: "#FED7D7" };
      return level ? `background-color: ${colors[level]}` : "";
    }}

    ${({ variant }) => {
      switch (variant) {
        case "button-white":
          return `
          background-color: var(--grey-1000-50);
          color: var(--blue-france-sun-113-625);
          font-weight: 700;
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
        default:
          return "";
      }
    }};

    ${({ square }) => {
      return square ? `border-radius: 4px;` : "";
    }}
  }
`;

export const TagStatutPublic = styled(TagStyled)`
  background-color: var(--info-950-100);
  color: var(--blue-france-sun-113-625);
  font-weight: 700;
`;

export const TagStatutPrive = styled(TagStyled)`
  background-color: #feebcb;
  color: #7b341e;
  font-weight: 700;
`;

export const TagDuree = styled(TagStyled)`
  background-color: var(--info-950-100);
  color: var(--info-425-625);
  font-weight: 700;
`;

export default TagStyled;
