/** @jsxImportSource @emotion/react */
import { formationsSimilaire } from "#/app/queries/formationsSimilaire/query";
import { FormationDetail } from "#/types/formation";
import { useQuery } from "@tanstack/react-query";
import { useQueryLocation } from "../../hooks/useQueryLocation";
import Loader from "#/app/components/Loader";
import FormationCard from "../../recherche/FormationCard";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grow, Theme } from "@mui/material";
import { useState } from "react";
import { css } from "@emotion/react";
import Button from "#/app/components/Button";

export default function FormationSimilare({ formationDetail }: { formationDetail: FormationDetail }) {
  const isSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const isMd = useMediaQuery<Theme>((theme) => theme.breakpoints.down("lg"));
  const isLg = useMediaQuery<Theme>((theme) => theme.breakpoints.down("xl"));

  const location = useQueryLocation();
  const longitude = location.longitude ?? formationDetail.etablissement.longitude ?? 0;
  const latitude = location.latitude ?? formationDetail.etablissement.latitude ?? 0;

  const eltByLine = isSm ? 2 : isMd ? 3 : isLg ? 4 : 5;
  const [lineToDisplay, setLineToDisplay] = useState(1);

  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formationSimilaire", formationDetail.formationEtablissement.id, latitude, longitude],
    queryFn: ({ signal }) => {
      return formationsSimilaire(
        { formationEtablissementId: formationDetail.formationEtablissement.id, latitude, longitude },
        { signal }
      );
    },
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data || data.length === 0) {
    return;
  }

  return (
    <Box style={{ backgroundColor: fr.colors.decisions.artwork.decorative.blueFrance.default, padding: "2rem" }}>
      <Typography variant="h3" style={{ marginBottom: "1.25rem" }}>
        Ces formations pourraient t’intéresser
      </Typography>

      <Grid container spacing={4}>
        {data.slice(0, eltByLine * lineToDisplay).map((formationDetail, index) => (
          <Grow in={true} unmountOnExit key={index}>
            <Grid item xs={12 / eltByLine}>
              <FormationCard
                formationDetail={formationDetail}
                latitude={latitude}
                longitude={longitude}
                selected={false}
                tabIndex={index}
                withDuration={false}
                withJPO={false}
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  backgroundColor: "white",
                }}
              />
            </Grid>
          </Grow>
        ))}

        {lineToDisplay * eltByLine < data.length && (
          <Grid item xs={12}>
            <Button priority="tertiary no outline" onClick={() => setLineToDisplay(lineToDisplay + 1)}>
              Voir plus de formation{" "}
              <i
                className={fr.cx("fr-icon-arrow-down-line")}
                css={css`
                  &::before {
                    --icon-size: 1.5rem;
                  }
                  margin-right: 0.25rem;
                `}
              ></i>
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
