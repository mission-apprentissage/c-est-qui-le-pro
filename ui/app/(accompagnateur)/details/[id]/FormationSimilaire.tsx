"use client";
/** @jsxImportSource @emotion/react */
import { formationsSimilaire } from "#/app/queries/formationsSimilaire/query";
import { FormationDetail } from "shared";
import { useQuery } from "@tanstack/react-query";
import { useQueryLocation } from "../../hooks/useQueryLocation";
import Loader from "#/app/components/Loader";
import { Grid } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grow, Theme } from "@mui/material";
import { useState } from "react";
import Button from "#/app/components/Button";
import Container from "#/app/components/Container";
import { useGetReverseLocation } from "../../hooks/useGetAddress";
import React from "react";
import {
  ArrowIcon,
  FormationContainer,
  HighlightedText,
  SectionTitle,
  StyledFormationCard,
} from "./FormationSimilaire.styled";

const FormationSimilaire = React.memo(({ formationDetail }: { formationDetail: FormationDetail }) => {
  const isSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const isMd = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));
  const isLg = useMediaQuery<Theme>((theme) => theme.breakpoints.down("xl"));

  const userLocation = useQueryLocation();
  const longitude = userLocation.longitude ?? formationDetail.etablissement.longitude ?? 0;
  const latitude = userLocation.latitude ?? formationDetail.etablissement.latitude ?? 0;
  const { data: location } = useGetReverseLocation({ latitude, longitude });

  const eltByLine = isSm ? 1 : isMd ? 3 : isLg ? 3 : 3;
  const lineMultiplier = isSm ? 4 : 1;
  const [lineToDisplay, setLineToDisplay] = useState(1);
  const totalDisplay = eltByLine * lineToDisplay * lineMultiplier;

  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formationSimilaire", formationDetail.formationEtablissement.id, latitude, longitude],
    queryFn: ({ signal }) => {
      return formationsSimilaire(
        {
          formationEtablissementId: formationDetail.formationEtablissement.id,
          latitude: location?.latitude,
          longitude: location?.longitude,
          academie: formationDetail.etablissement.academie,
        },
        { signal }
      );
    },
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data || data.length === 0) {
    return null;
  }

  return (
    <FormationContainer>
      <Container maxWidth={"xl"}>
        <SectionTitle variant="h3">
          Ces formations, <HighlightedText>à côté de {location?.city}</HighlightedText>, pourraient t&apos;intéresser
        </SectionTitle>

        <Grid container spacing={4}>
          {data.slice(0, totalDisplay).map((formationDetail, index) => (
            <Grow in={true} unmountOnExit key={`formation-similaire-${index}`}>
              <Grid item xs={12 / eltByLine}>
                <StyledFormationCard
                  formationDetail={formationDetail}
                  location={location}
                  selected={false}
                  tabIndex={index}
                  withDuration={true}
                  withJPO={false}
                />
              </Grid>
            </Grow>
          ))}

          {totalDisplay < data.length && (
            <Grid item xs={12}>
              <Button priority="tertiary no outline" onClick={() => setLineToDisplay(lineToDisplay + 1)}>
                Voir plus de formations <ArrowIcon className={fr.cx("fr-icon-arrow-down-line")} />
              </Button>
            </Grid>
          )}
        </Grid>
      </Container>
    </FormationContainer>
  );
});
FormationSimilaire.displayName = "FormationSimilaire";

export default FormationSimilaire;
