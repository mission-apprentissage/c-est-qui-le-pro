"use client";
import { Box } from "@mui/material";
import styled from "@emotion/styled";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import FormationDescription from "#/app/(accompagnateur)/components/FormationDescription";
import { Formation } from "shared";
import Link from "#/app/components/Link";
import Card from "#/app/components/Card";
import { fr } from "@codegouvfr/react-dsfr";
import Container from "#/app/components/Container";
import { useCallback, useState } from "react";
import Button from "#/app/components/Button";
import { formatLibelle } from "#/app/utils/formation";
import { BlockDivider, ContentContainer } from "./FormationBlock.styled";

const FormationBox = styled(Box)`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding: 1rem;
  background-color: ${fr.colors.options.blueFrance._975_75.default};
`;

const GridContainer = styled(Grid)`
  margin-top: 1.25rem;
`;

export default function FormationBlockPoursuite({
  formation,
  ...cardProps
}: {
  formation: Formation;
} & React.ComponentProps<typeof Card>) {
  const [nbrDisplay, setNbrDisplay] = useState(3);

  const showMoreCb = useCallback(() => {
    setNbrDisplay(formation.formationPoursuite?.length || 3);
  }, [formation.formationPoursuite?.length]);

  return (
    <Card type="details" title={"La poursuite d'études"} {...cardProps}>
      <ContentContainer>
        <FormationDescription description={formation.descriptionPoursuiteEtudes}></FormationDescription>
        {formation.formationPoursuite && !formation.isAnneeCommune && (
          <>
            <Container>
              <Typography variant="h3">Quelles études sont envisageables après la formation ?</Typography>
              <GridContainer container spacing={"1.25rem"}>
                {formation.formationPoursuite.slice(0, nbrDisplay).map((formationPoursuite, index) => {
                  return (
                    <Grid item xs={12} key={index}>
                      <FormationBox>
                        <Typography variant="subtitle2">
                          {formationPoursuite.onisepId ? (
                            <Link
                              target="_blank"
                              href={`https://www.onisep.fr/http/redirection/formation/slug/${formationPoursuite.onisepId}`}
                            >
                              {formatLibelle(formationPoursuite.libelle)}
                            </Link>
                          ) : (
                            formatLibelle(formationPoursuite.libelle)
                          )}
                        </Typography>
                      </FormationBox>
                    </Grid>
                  );
                })}

                {formation.formationPoursuite.length > nbrDisplay && (
                  <Grid item xs={12}>
                    <Button priority="tertiary" size="small" onClick={showMoreCb}>
                      Voir plus
                    </Button>
                  </Grid>
                )}
              </GridContainer>
            </Container>
            <BlockDivider />
          </>
        )}
      </ContentContainer>
    </Card>
  );
}
