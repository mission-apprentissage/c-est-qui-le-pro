"use client";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import FormationDescription from "../../components/FormationDescription";
import { FormationDetail } from "shared";
import Card from "#/app/components/Card";
import Link from "#/app/components/Link";
import WidgetSiriusFormation from "../../components/WidgetSiriusFormation";
import FormationsFamilleMetier from "../../components/FormationFamilleMetier";
import { ContentContainer } from "./FormationBlock.styled";

const StyledLink = styled(Link)`
  color: var(--blue-france-sun-113-625);
`;

export default function FormationBlockFormation({
  formationDetail,
  ...cardProps
}: {
  formationDetail: FormationDetail;
} & React.ComponentProps<typeof Card>) {
  const { formation } = formationDetail;

  return (
    <Card type="details" title={"La formation"} {...cardProps}>
      <ContentContainer>
        <FormationsFamilleMetier withLink formationDetail={formationDetail} />

        <FormationDescription description={formation.description}>
          {formation.description && (
            <Box>
              <StyledLink
                target="_blank"
                href={`https://www.onisep.fr/http/redirection/formation/slug/${formation?.onisepIdentifiant}`}
              >
                En savoir plus, sur le site de l&apos;Onisep
              </StyledLink>
            </Box>
          )}
        </FormationDescription>
        {formation.voie === "apprentissage" && (
          <Box>
            <WidgetSiriusFormation formation={formation} fallbackComponent={<></>} />
          </Box>
        )}
      </ContentContainer>
    </Card>
  );
}
