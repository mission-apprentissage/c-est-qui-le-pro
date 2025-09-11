import { styled } from "@mui/material/styles";

export const StyledSvgIcon = styled("i")`
  padding-right: 0.375rem;

  & svg {
    vertical-align: calc((0.75em - var(--icon-size)) * 0.5);
    width: var(--icon-size);
    height: var(--icon-size);
    --icon-size: 1.5rem;
  }
`;
