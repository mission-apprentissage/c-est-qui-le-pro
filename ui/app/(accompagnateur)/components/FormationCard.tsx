import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "shared";
import "moment/locale/fr";
import { TagPortesOuvertes } from "./PortesOuvertes";
import Card from "#/app/components/Card";
import FormationTags from "./FormationTags";
import { useFormationLink } from "../hooks/useFormationLink";
import { LabelApprentissage } from "./Apprentissage";
import { formatAccessTime, formatLibelle, formatStatut } from "#/app/utils/formation";
import { TagStatutPrive, TagStatutPublic } from "#/app/components/Tag";
import { capitalize } from "lodash-es";
import FormationsFamilleMetier from "./FormationFamilleMetier";
import { SerializedStyles } from "@emotion/react";

export default React.memo(function FormationCard({
  latitude,
  longitude,
  formationDetail,
  selected,
  onMouseEnter,
  onMouseLeave,
  tabIndex,
  withJPO = true,
  withDuration = true,
  style = undefined,
  css = undefined,
  className = undefined,
}: {
  latitude: number;
  longitude: number;
  formationDetail: FormationDetail;
  selected: boolean;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
  tabIndex: number;
  withJPO?: boolean;
  withDuration?: boolean;
  style?: React.CSSProperties;
  css?: SerializedStyles;
  className?: string;
}) {
  const { formationEtablissement, formation, etablissement } = formationDetail;
  const formationLink = useFormationLink({
    formationDetail: formationDetail,
    longitude: longitude.toString(),
    latitude: latitude.toString(),
  });

  return (
    <Card
      selected={selected}
      actionProps={{
        onMouseEnter: () => onMouseEnter && onMouseEnter(),
        onMouseLeave: () => onMouseLeave && onMouseLeave(),
      }}
      link={formationLink}
      linkTarget="_blank"
      tabIndex={tabIndex}
      style={style}
      className={className}
      type={"formation"}
    >
      <Box style={{ padding: "1.25rem" }}>
        <Stack direction={"row"} spacing={1} useFlexGap sx={{ flexWrap: "wrap", marginBottom: fr.spacing("3v") }}>
          <LabelApprentissage formation={formation} />

          {etablissement.statut && (
            <Box>
              {etablissement.statut === "public" ? (
                <TagStatutPublic>{capitalize(formatStatut(etablissement))}</TagStatutPublic>
              ) : (
                <TagStatutPrive>{capitalize(formatStatut(etablissement))}</TagStatutPrive>
              )}
            </Box>
          )}

          {withJPO && <TagPortesOuvertes etablissement={etablissement} />}

          <FormationTags tags={formationEtablissement.tags || []} />
        </Stack>

        <Typography variant="subtitle2" style={{ lineHeight: "28px" }}>
          {formatLibelle(formation.libelle)}
        </Typography>

        <Typography variant={"body2"} style={{ color: "#3A3A3A", lineHeight: "24px" }}>
          {etablissement.libelle}
        </Typography>
        <Typography variant={"body2"} style={{ color: "#3A3A3A", lineHeight: "24px" }}>
          {etablissement.addressCity}
        </Typography>

        {withDuration && (
          <Grid container style={{ marginTop: fr.spacing("5v") }}>
            <Grid item xs={10}>
              {etablissement.accessTime ? (
                <Typography variant="subtitle4" color={"var(--blue-france-sun-113-625)"}>
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />
                  {formatAccessTime(etablissement.accessTime)}
                </Typography>
              ) : (
                etablissement.distance && (
                  <Typography variant="subtitle4" color={"var(--blue-france-sun-113-625)"}>
                    <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-car-fill")} />À{" "}
                    {Math.round(etablissement.distance / 1000)} km
                  </Typography>
                )
              )}
            </Grid>
            <Grid item xs={2}></Grid>
          </Grid>
        )}
      </Box>

      <FormationsFamilleMetier
        small
        sx={{
          padding: "0.5rem 0.75rem",
          marginTop: "0.75rem",
          borderTop: "1px solid " + fr.colors.decisions.border.default.grey.default,
          paddingBottom: "1.125rem",
        }}
        formationDetail={formationDetail}
      />
    </Card>
  );
});
