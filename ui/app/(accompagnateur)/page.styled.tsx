"use client";
import Container from "#/app/components/Container";
import { Box, Grid, Typography, Stack } from "#/app/components/MaterialUINext";
import Button from "#/app/components/Button";
import Image from "next/image";
import { styled } from "@mui/material/styles";
import { fr } from "@codegouvfr/react-dsfr";

export const MainContainer = styled(Box, {
  shouldForwardProp: (prop) => !["bgColor"].includes(prop as string),
})<{ bgColor?: "blue" | "white" }>`
  ${(props) => (props.bgColor === "blue" ? "background-color: var(--blue-france-975-75);" : "")}
  ${(props) => (props.bgColor === "white" ? "white;" : "")}
  padding-top: 4.75rem;
  padding-bottom: 6.5rem;
  align-items: center;
  display: flex;
  flex-direction: column;
  
  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

}
`;

export const MainBlueContainer = styled(Container)`
  background-color: var(--blue-france-975-75);
`;

export const MainWhiteContainer = styled(Container)`
  background-color: white;
`;

export const MainTitleGrid = styled(Grid)`
  ${({ theme }) => theme.breakpoints.up("md")} {
    padding: 0;
    padding-bottom: 3rem;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding-bottom: 1rem;
  }
`;

export const MainTitle = styled(Typography)`
  color: var(--blue-france-sun-113-625-hover);
`;

export const CitySuggestionStack = styled(Stack)`
  margin-top: 2.5rem;
`;

export const AddressButton = styled(Button)`
  padding-right: 0.75rem;
  padding-left: 0.75rem;
`;

export const ImageGrid = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const HomeImage = styled(Image)`
  width: 100%;
  max-width: 399px;
  height: auto;
`;

export const LogoStack = styled(Stack)`
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
`;

export const PreviewImageBox = styled(Box)`
  display: flex;
  justify-content: center;
  width: 100%;
  height: auto;
`;

export const PreviewImage = styled(Image)`
  width: 100%;
  max-width: 1108px;
  height: auto;

  ${({ theme }) => theme.breakpoints.down("sm")} {
    margin-bottom: 1.5rem;
  }
`;

export const BrMobile = styled("br")`
  display: none;

   ${({ theme }) => theme.breakpoints.down("sm")} {
     display: block;
  }
}
`;

export const ErrorBox = styled(Box, {
  shouldForwardProp: (prop) => !["isHomeSearch", "isDownSm"].includes(prop as string),
})<{ isHomeSearch?: boolean; isDownSm?: boolean }>`
  color: ${fr.colors.decisions.artwork.minor.redMarianne.default};
  font-size: 0.75rem;
  ${({ isDownSm, isHomeSearch }) =>
    isDownSm
      ? `
    ${isHomeSearch ? "padding-left: 1rem;" : "padding-left: 0rem;"}
    margin-bottom: 0.5rem;
    text-align: center;
  `
      : ``}

  ${({ isDownSm, isHomeSearch }) =>
    !isDownSm
      ? `
    ${isHomeSearch ? "padding-left: 3rem;" : "padding-left: 0rem;"}
    margin-bottom: 1rem;
  `
      : ``}
`;
