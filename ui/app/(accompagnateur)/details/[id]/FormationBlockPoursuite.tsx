"use client";
import { Box } from "@mui/material";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import FormationDescription from "../../components/FormationDescription";
import { Formation } from "shared";
import Link from "#/app/components/Link";
import Card from "#/app/components/Card";
import { fr } from "@codegouvfr/react-dsfr";
import Container from "#/app/components/Container";
import { useCallback, useState } from "react";
import Button from "#/app/components/Button";
import { formatLibelle } from "#/app/utils/formation";

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
      <FormationDescription description={formation.descriptionPoursuiteEtudes}></FormationDescription>
      {formation.formationPoursuite && !formation.isAnneeCommune && (
        <Container style={{ marginTop: "2rem", marginBottom: "2rem" }}>
          <Typography variant="h3" style={{ marginBottom: "1rem" }}>
            Quelles études sont envisageables après la formation ?
          </Typography>
          <Grid container spacing={"1.25rem"}>
            {formation.formationPoursuite.slice(0, nbrDisplay).map((formationPoursuite, index) => {
              return (
                <Grid item xs={12} key={index}>
                  <Box
                    style={{
                      paddingTop: "0.5rem",
                      paddingBottom: "0.5rem",
                      padding: "1rem",
                      backgroundColor: fr.colors.options.blueFrance._975_75.default,
                    }}
                  >
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
                  </Box>
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
          </Grid>
        </Container>
      )}
    </Card>
  );
}
