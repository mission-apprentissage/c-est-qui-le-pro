"use client";
import Container from "#/app/components/Container";
import { Grid, Typography } from "#/app/components/MaterialUINext";
import { styled } from "@mui/material/styles";

export const MainContainer = styled(Container)`
  background-color: var(--blue-france-975-75);
  padding-bottom: 10rem;
`;

export const MainTitleGrid = styled(Grid)`
  ${({ theme }) => theme.breakpoints.up("md")} {
    padding: 0;
    padding-bottom: 3rem;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
  }
`;

export const MainTitle = styled(Typography)`
  color: var(--blue-france-sun-113-625-hover);
`;

export const SearchFormGrid = styled(Grid)`
  background-color: var(--blue-france-sun-113-625-hover);
  border-radius: 11px;
  margin-bottom: 3rem;

  ${({ theme }) => theme.breakpoints.up("md")} {
    padding: 2.875rem;
    padding-left: 2.25rem;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
    padding-top: 2rem;
    padding-bottom: 2rem;
    margin-bottom: 2rem;
    border-radius: 0;
  }
`;

export const InfoSectionGrid = styled(Grid)`
  ${({ theme }) => theme.breakpoints.up("md")} {
    padding: 0;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
  }
`;

export const SubTitle = styled(Typography)`
  color: var(--blue-france-sun-113-625-hover);
  font-size: 1.125rem;
  line-height: 1.75rem;
  margin-bottom: 1rem;
`;

export const DescriptionText = styled(Typography)`
  margin-bottom: 1.5rem;
`;
