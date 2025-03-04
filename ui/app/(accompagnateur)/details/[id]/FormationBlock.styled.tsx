/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { Box, Grid } from "#/app/components/MaterialUINext";
import Divider from "#/app/components/Divider";
import { fr } from "@codegouvfr/react-dsfr";

export const ContentContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
`;

export const CenteredGrid = styled(Grid)`
  text-align: center;
`;

export const BlockDivider = styled(Divider)`
  margin: 0px;
  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
`;

export const HighlightBox = styled(({ className = "", ...props }) => (
  <Box className={`${fr.cx("fr-highlight")} ${className}`} {...props} />
))`
  margin-left: 0;
`;
