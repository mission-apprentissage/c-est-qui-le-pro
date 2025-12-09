"use client";
import styled from "@emotion/styled";
import { ContainerProps as MUIContainerProps } from "@mui/material/Container";
import { Container as MUIContainer } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";

function InformationCard({ children, ...props }: MUIContainerProps) {
  return (
    <MUIContainer {...props}>
      <>{children}</>
    </MUIContainer>
  );
}

export default styled(InformationCard)<MUIContainerProps>`
  background-color: #e3e3fd;
  border: 1px solid #dddddd;
  border-radius: 10px;
  padding-top: ${fr.spacing("3v")};
  padding-bottom: ${fr.spacing("3v")};
`;
