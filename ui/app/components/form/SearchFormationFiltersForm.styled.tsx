/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import { Box, Typography } from "@mui/material";
import Button from "../Button";

export const MobileContainer = styled(Box)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: white;
  z-index: 9999;
  display: flex;
  flex-direction: column;
`;

export const MobileHeaderContainer = styled(Box)`
  display: flex;
  margin-left: 1rem;
  margin-right: 1rem;
  align-items: center;
`;

export const MobileHeaderTitle = styled(Typography)`
  text-align: center;
  flex: 1;
  margin: 0.5rem;
`;

export const MobileContentContainer = styled(Box)`
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  overflow: scroll;
  display: flex;
  padding-bottom: 1rem;
  flex-direction: column;
`;

export const MobileSubtitle = styled(Typography)`
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

export const MobileFooter = styled(Box)`
  display: flex;
  padding: 1rem;
  padding-left: 2rem;
  padding-right: 2rem;
  align-items: center;
  justify-content: space-between;
`;

export const ClearButtonText = styled(Typography)`
  font-weight: 700;
`;

export const DesktopFilterContainer = styled(Box)`
  display: flex;
  justify-content: flex-end;
`;

export const FilterIcon = styled.i`
  padding-right: 0.5rem;

  &[class^="ri-"]::before {
    --icon-size: 1.2rem;
  }
`;

export const FilterButton = styled(Button)`
  position: relative;
`;

export const FilterBadge = styled(Box)`
  position: absolute;
  width: 16px;
  height: 16px;
  right: 0;
  top: 0;
  background: #1212ff;
  border-radius: 8px;
`;
