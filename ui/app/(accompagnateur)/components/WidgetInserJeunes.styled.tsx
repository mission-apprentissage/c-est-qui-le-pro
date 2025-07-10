/** @jsxImportSource @emotion/react */
"use client";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { styled } from "@mui/material";
import Divider from "#/app/components/Divider";

export const StyledTitle = styled(Typography)`
  margin-bottom: 1rem;

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-bottom: 1.5rem;
  }
`;

export const ErrorContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1rem;
`;

export const ErrorList = styled(Box)`
  display: flex;
  gap: 0.5rem;
`;

export const AllPersonasContainer = styled(Box, {
  shouldForwardProp: (prop) => !["vertical"].includes(prop as string),
})<{ vertical: boolean }>`
  display: flex;
  flex-direction: ${(props) => (props.vertical ? "column" : "row")};
  gap: ${(props) => (props.vertical ? "1.5rem" : "1.5rem")};
  justify-content: center;
`;

export const PersonasContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 0.125rem;
  ${({ theme }) => theme.breakpoints.down("md")} {
    line-height: 0;
    margin-bottom: 0.5rem;
  }
`;

export const DescriptionContainer = styled(Box)`
  display: flex;
  flex-direction: row;
  gap: 1.25rem;
  justify-content: center;
`;

export const Description = styled(Box, {
  shouldForwardProp: (prop) => !["vertical", "color"].includes(prop as string),
})<{
  color: string;
  vertical?: boolean;
}>`
  flex: 1;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  align-items: ${(props) => (props.vertical ? "flex-start" : "center")};
  color: ${(props) => props.color};
  cursor: pointer;

  & > div:first-child {
    font-size: 1.125rem;
    font-weight: bold;
  }

  ${({ theme }) => theme.breakpoints.up("sm")} {
    & > div:last-child {
      gap: 0.25rem;
      display: flex;
      flex-direction: row;
      flew-wrap: wrap;
      ${(props) => (props.vertical ? "font-size: 1.125rem;" : "")}
    }
  }

  & > div:last-child {
    font-size: 0.875rem;
    font-weight: 700;
    ${(props) => (props.vertical ? "font-size: 1.125rem;" : "")}

    & > div {
      display: flex;
      gap: 0.25rem;
    }

    & i::before {
      --icon-size: 1.25rem;
    }
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-left: 0.5rem;
  }
`;

export const IndicateursContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const PersonaContainer = styled(Box)`
  position: relative;
  width: 100%;
  max-width: 48px;

  ${({ theme }) => theme.breakpoints.down("md")} {
    max-width: 44px;
  }

  & i {
    position: absolute;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -55%);
    color: white;
    width: 40%;
    height: 40%;
    &::before {
      --icon-size: 100%;
    }
  }
`;

export const StyledFormationLibelle = styled(Typography, {
  shouldForwardProp: (prop) => !["active"].includes(prop as string),
})<{ active: boolean }>`
  color: ${(props) => (props.active ? "#000091" : "#929292")};
  margin-bottom: 0rem;
`;

export const StyledDivider = styled(Divider, {
  shouldForwardProp: (prop) => !["active"].includes(prop as string),
})<{ active: boolean }>`
  margin-top: 2rem;
  margin-bottom: 3rem;

  ${(props) => props.theme.breakpoints.down("md")} {
    margin-top: 2rem;
    margin-bottom: 3rem;
  }
`;

export const AccordionContainer = styled(Box)`
  margin-top: 1rem;
`;

export const ContainerAnneeCommune = styled(Box)`
  max-width: 650px;
  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-left: 0.75rem;
  }
`;

export const ContainerFormation = styled(Box)`
  max-width: 700px;
  gap: 1.5rem;
  display: flex;
  flex-direction: column;
  ${({ theme }) => theme.breakpoints.down("md")} {
    margin-left: 0.75rem;
  }
`;
