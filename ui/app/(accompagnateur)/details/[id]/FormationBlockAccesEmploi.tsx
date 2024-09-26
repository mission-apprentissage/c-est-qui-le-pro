/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import Card from "#/app/components/Card";
import { capitalize } from "lodash-es";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { Etablissement, Formation, Metier, MetierTransitionType } from "#/types/formation";
import WidgetInserJeunes from "../../components/WidgetInserJeunes";
import Button from "#/app/components/Button";
import { METIER_TRANSITION, sortMetier } from "#/app/services/metier";
import Tag from "#/app/components/Tag";

function TagTransition({ metier, type }: { metier: Metier; type: MetierTransitionType }) {
  return (
    metier[type] && (
      <Tag square variant="blue" style={{ padding: "0.375rem", marginBottom: "0.5rem" }}>
        <Typography variant="body3" style={{ fontWeight: 700 }}>
          <i
            className={fr.cx(METIER_TRANSITION[type].icon)}
            css={css`
              &::before {
                --icon-size: 1rem;
              }
              margin-right: 0.25rem;
            `}
          ></i>
          {METIER_TRANSITION[type].label.toUpperCase()}
        </Typography>
      </Tag>
    )
  );
}

function FormationMetier({ formation }: { formation: Formation }) {
  const [nbrDisplay, setNbrDisplay] = useState(6);
  const metierSorted = useMemo(() => sortMetier(formation.metier || []), [formation.metier]);

  const showMoreCb = useCallback(() => {
    setNbrDisplay(metierSorted.length || 6);
  }, [metierSorted.length]);

  return (
    metierSorted &&
    metierSorted.length > 0 && (
      <>
        <Typography variant="h3" style={{ marginTop: "1.25rem", marginBottom: "1.25rem" }}>
          Quels métiers sont possibles ?
        </Typography>
        <Box style={{ display: "flex", width: "100%", justifyContent: "flex-start" }}>
          <Grid container spacing={4}>
            {metierSorted.slice(0, nbrDisplay).map((metier) => {
              return (
                <Grid key={metier.id} item xs={6}>
                  <Card
                    style={{
                      height: "100%",
                      borderRadius: 0,
                      padding: "1.5rem",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                    link={
                      metier.onisepLink
                        ? metier.onisepLink
                        : metier.franceTravailLink
                        ? metier.franceTravailLink
                        : undefined
                    }
                  >
                    <TagTransition metier={metier} type="transitionEcologique" />
                    <TagTransition metier={metier} type="transitionDemographique" />
                    <TagTransition metier={metier} type="transitionNumerique" />
                    <Typography variant="subtitle1">{capitalize(metier.libelle)}</Typography>
                  </Card>
                </Grid>
              );
            })}
            <Grid item xs={12} style={{ textAlign: "center" }}>
              {metierSorted.length > nbrDisplay && (
                <Button priority="tertiary" size="small" onClick={showMoreCb}>
                  Voir plus
                </Button>
              )}
            </Grid>
          </Grid>
        </Box>
      </>
    )
  );
}

export default function FormationBlockAccesEmploi({
  formation,
  etablissement,
  ...cardProps
}: {
  formation: Formation;
  etablissement: Etablissement;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title="L’accès à l’emploi" {...cardProps}>
      <Typography variant="h3">Que sont devenus les anciens élèves 6 mois après cette formation ?</Typography>
      <WidgetInserJeunes etablissement={etablissement} formation={formation} />

      <FormationMetier formation={formation} />
    </Card>
  );
}
