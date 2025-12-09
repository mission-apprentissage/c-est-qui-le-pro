/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from "react";
import { fr } from "@codegouvfr/react-dsfr";
import Card from "#/app/components/Card";
import { capitalize } from "lodash-es";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { Formation, FormationDetail, Metier, MetierTransitionType } from "shared";
import WidgetInserJeunes from "#/app/(accompagnateur)/components/WidgetInserJeunes";
import Button from "#/app/components/Button";
import { METIER_TRANSITION, sortMetier } from "#/app/services/metier";
import { BlockDivider, CenteredGrid, ContentContainer } from "./FormationBlock.styled";
import { TransitionIcon, MetierCard, TransitionTag, MetierContainer } from "./FormationBlockAccesEmploi.styled";
import { FormationSalaire, FormationSalaireGlobal } from "./FormationBlockAccessEmploiSalaire";

function TagTransition({ metier, type }: { metier: Metier; type: MetierTransitionType }) {
  return (
    metier[type] && (
      <TransitionTag square variant="blue">
        <Typography variant="body3" component={"span"}>
          <TransitionIcon className={fr.cx(METIER_TRANSITION[type].icon)} />
          {METIER_TRANSITION[type].label.toUpperCase()}
        </Typography>
      </TransitionTag>
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
        <BlockDivider />
        <Box>
          <Typography variant="h3">Quels métiers sont possibles ?</Typography>
          <MetierContainer>
            <Grid container spacing={4}>
              {metierSorted.slice(0, nbrDisplay).map((metier) => (
                <Grid key={metier.id} item xs={12} sm={6}>
                  <MetierCard
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
                  </MetierCard>
                </Grid>
              ))}
              {metierSorted.length > nbrDisplay && (
                <CenteredGrid item xs={12}>
                  <Button priority="tertiary" size="small" onClick={showMoreCb}>
                    Voir plus
                  </Button>
                </CenteredGrid>
              )}
            </Grid>
          </MetierContainer>
        </Box>
      </>
    )
  );
}

export default function FormationBlockAccesEmploi({
  formationDetail,

  ...cardProps
}: {
  formationDetail: FormationDetail;
} & React.ComponentProps<typeof Card>) {
  const { formation } = formationDetail;
  return (
    <Card type="details" title="L'accès à l'emploi" {...cardProps}>
      <ContentContainer>
        <Box>
          <WidgetInserJeunes formationDetail={formationDetail} />
        </Box>
        <FormationSalaire formation={formation} />
        <FormationSalaireGlobal formation={formation} />
        <FormationMetier formation={formation} />
      </ContentContainer>
    </Card>
  );
}
