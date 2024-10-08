import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "#/types/formation";
import "moment/locale/fr";
import { TagPortesOuvertes } from "./PortesOuvertes";
import Card from "#/app/components/Card";
import FormationTags from "./FormationTags";
import { useFormationLink } from "../hooks/useFormationLink";
import { LabelApprentissage } from "./Apprentissage";
import { formatLibelle } from "#/app/utils/formation";
import { TagStatutPrive, TagStatutPublic } from "#/app/components/Tag";
import { capitalize } from "lodash-es";

function formatAccessTime(time: number) {
  if (time >= 3600) {
    return (
      <>
        À moins de {Math.floor(time / 3600).toFixed(0)}h{(time % 3600) / 60 || ""}
      </>
    );
  }

  return <>À moins de {(time / 60).toFixed(0)} minutes</>;
}

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
    >
      <Stack
        spacing={1}
        style={{
          marginBottom: formationEtablissement.tags && formationEtablissement.tags.length > 0 ? fr.spacing("3v") : 0,
        }}
      >
        <FormationTags tags={formationEtablissement.tags || []} />
      </Stack>
      <LabelApprentissage formation={formation} />

      <Typography variant="subtitle2" style={{ lineHeight: "28px" }}>
        {formatLibelle(formation.libelle)}
      </Typography>

      <Typography variant={"body2"} style={{ color: "#3A3A3A", lineHeight: "24px" }}>
        {etablissement.libelle}
      </Typography>
      <Typography variant={"body2"} style={{ color: "#3A3A3A", lineHeight: "24px" }}>
        {etablissement.addressCity}
      </Typography>
      {etablissement.statut && (
        <Box style={{ marginTop: "0.75rem" }}>
          {etablissement.statut === "public" ? (
            <TagStatutPublic>{capitalize(etablissement.statut)}</TagStatutPublic>
          ) : (
            <TagStatutPrive>{capitalize(etablissement.statut)}</TagStatutPrive>
          )}
        </Box>
      )}

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
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-fill")} />À{" "}
                  {(etablissement.distance / 1000).toFixed(2)} km
                </Typography>
              )
            )}
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
      )}

      {withJPO && <TagPortesOuvertes etablissement={etablissement} />}
    </Card>
  );
});
