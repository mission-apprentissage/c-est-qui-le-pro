"use client";
/** @jsxImportSource @emotion/react */
import FormationCard from "../../components/FormationCard";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import styled from "@emotion/styled";

export const FormationContainer = styled(Box)`
  background-color: ${fr.colors.decisions.artwork.decorative.blueFrance.default};
  padding: 2rem;
`;

export const SectionTitle = styled(Typography)`
  margin-bottom: 1.25rem;
`;

export const HighlightedText = styled.span`
  color: #0063cb;
`;

export const StyledFormationCard = styled(FormationCard)`
  &.MuiButtonBase-root:hover {
    background-color: white;
  }

  & .MuiCardActionArea-focusHighlight {
    display: block;
  }

  height: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
`;

export const ArrowIcon = styled.i`
  &::before {
    --icon-size: 1.5rem;
  }
  margin-right: 0.25rem;
`;
