/** @jsxImportSource @emotion/react */
import React from "react";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { DiplomeTypeLibelle, FormationDetail } from "shared";
import "moment/locale/fr";
import { TagPortesOuvertes } from "./PortesOuvertes";
import Card from "#/app/components/Card";
import FormationTags from "./FormationTags";
import { useFormationLink } from "../hooks/useFormationLink";
import { LabelApprentissage } from "./Apprentissage";
import { formatAccessTime, formatLibelle } from "#/app/utils/formation";
import { TagDiplome } from "#/app/components/Tag";
import FormationsFamilleMetier from "./FormationFamilleMetier";
import { SerializedStyles } from "@emotion/react";
import TagEtablissement from "./TagEtablissement";
import { UserLocation } from "#/types/userLocation";
import OutsideAcademieTooltip from "./OutsideAcademieTooltip";

export default React.memo(function FormationCard({
  location,
  formationDetail,
  selected,
  onMouseEnter,
  onMouseLeave,
  tabIndex,
  withJPO = true,
  withDuration = true,
  withOutsideAcademie = false,
  style = undefined,
  css = undefined,
  className = undefined,
}: {
  location?: UserLocation | null;
  formationDetail: FormationDetail;
  selected: boolean;
  onMouseEnter?: Function;
  onMouseLeave?: Function;
  tabIndex: number;
  withJPO?: boolean;
  withDuration?: boolean;
  withOutsideAcademie?: boolean;
  style?: React.CSSProperties;
  css?: SerializedStyles;
  className?: string;
}) {
  const { formationEtablissement, formation, etablissement } = formationDetail;
  const formationLink = useFormationLink({
    formationDetail: formationDetail,
    longitude: location ? location.longitude.toString() : "",
    latitude: location ? location.latitude.toString() : "",
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
          {formation.niveauDiplome && DiplomeTypeLibelle[formation.niveauDiplome] && (
            <TagDiplome>{DiplomeTypeLibelle[formation.niveauDiplome]}</TagDiplome>
          )}
          <LabelApprentissage formation={formation} />

          <TagEtablissement etablissement={etablissement} />

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
          <Box
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "left",
              flexWrap: "wrap",
              marginTop: "0.75rem",
            }}
          >
            <Box style={{ marginLeft: "-0.5rem" }}>{withOutsideAcademie && <OutsideAcademieTooltip />}</Box>
            <Box>
              {etablissement.accessTime ? (
                <Typography variant="subtitle4" color={"var(--blue-france-sun-113-625)"}>
                  <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-bus-line")} />
                  {formatAccessTime(etablissement.accessTime, etablissement.modalite)}
                </Typography>
              ) : (
                etablissement.distance && (
                  <Typography variant="subtitle4" color={"var(--blue-france-sun-113-625)"}>
                    <i style={{ marginRight: fr.spacing("2v") }} className={fr.cx("fr-icon-car-fill")} />À{" "}
                    {Math.round(etablissement.distance / 1000)} km
                  </Typography>
                )
              )}
            </Box>
          </Box>
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
