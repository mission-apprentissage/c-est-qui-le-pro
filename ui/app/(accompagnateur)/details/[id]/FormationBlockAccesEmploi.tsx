/** @jsxImportSource @emotion/react */
import { useCallback, useMemo, useState } from "react";
import styled from "@emotion/styled";
import { fr } from "@codegouvfr/react-dsfr";
import Card from "#/app/components/Card";
import { capitalize } from "lodash-es";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { Etablissement, Formation, Metier, MetierTransitionType } from "shared";
import WidgetInserJeunes from "../../components/WidgetInserJeunes";
import Button from "#/app/components/Button";
import { METIER_TRANSITION, sortMetier } from "#/app/services/metier";
import Tag from "#/app/components/Tag";
import { BlockDivider, CenteredGrid, ContentContainer } from "./FormationBlock.styled";

export const TransitionIcon = styled.i`
  &::before {
    --icon-size: 1rem;
  }
  margin-right: 0.25rem;
`;

export const MetierCard = styled(Card)`
  height: 100%;
  border-radius: 0;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
`;

export const TransitionTag = styled(Tag)`
  padding: 0.375rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
`;

export const MetierContainer = styled(Box)`
  display: flex;
  width: 100%;
  justify-content: flex-start;
`;

function TagTransition({ metier, type }: { metier: Metier; type: MetierTransitionType }) {
  return (
    metier[type] && (
      <TransitionTag square variant="blue">
        <Typography variant="body3">
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
  formation,
  etablissement,
  ...cardProps
}: {
  formation: Formation;
  etablissement: Etablissement;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title="L'accès à l'emploi" {...cardProps}>
      <ContentContainer>
        <Box>
          {formation.isAnneeCommune ? (
            <Typography variant="h3">
              Que sont devenus les anciens élèves 6 mois après ces différents BAC PRO ?
            </Typography>
          ) : (
            <Typography variant="h3">Que sont devenus les anciens élèves 6 mois après cette formation ?</Typography>
          )}
          <WidgetInserJeunes etablissement={etablissement} formation={formation} />
        </Box>
        <FormationMetier formation={formation} />
      </ContentContainer>
    </Card>
  );
}
