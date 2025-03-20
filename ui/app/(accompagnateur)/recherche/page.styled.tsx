/** @jsxImportSource @emotion/react */
"use client";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { styled } from "@mui/material/styles";

export const HeaderContainer = styled(Box)`
  ${({ theme }) => theme.breakpoints.down("md")} {
    position: sticky;
    top: 0;
    z-index: 999;
  }
`;

export const LoaderContainer = styled(Box)`
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 100vh;

  ${({ theme }) => theme.breakpoints.up("md")} {
    padding: 2rem;
    padding-top: 5rem;
  }

  ${({ theme }) => theme.breakpoints.down("md")} {
    padding: 1rem;
    padding-top: 5rem;
  }
`;

export const LoadingMessage = styled(Typography)`
  text-align: center;
`;
