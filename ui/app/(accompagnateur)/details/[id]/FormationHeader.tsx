/** @jsxImportSource @emotion/react */
"use client";
import React, { useEffect } from "react";
import { css, Theme } from "@emotion/react";
import { Box, Stack, useTheme } from "@mui/material";
import { Typography, Grid, BoxContainer } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { useSearchParams } from "next/navigation";
import { DiplomeTypeLibelle, FormationDetail, FormationTag } from "shared";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import PortesOuvertesHeader from "./PortesOuvertesHeader";
import FormationResume from "./FormationResume";
import { TagStatutPublic, TagStatutPrive, TagDuree, TagDiplome } from "#/app/components/Tag";
import { useSize } from "#/app/(accompagnateur)/hooks/useSize";
import { modalMinistage } from "#/app/(accompagnateur)/components/DialogMinistage";
import FormationRoute from "./FormationRoute";
import FormationDisponible from "./FormationDisponible";
import Link from "#/app/components/Link";
import { LabelApprentissage } from "#/app/(accompagnateur)/components/Apprentissage";
import { formatLibelle, formatStatut } from "#/app/utils/formation";
import { useFormationsDetails } from "../../context/FormationDetailsContext";
import { capitalize } from "lodash-es";
import FormationTags from "../../components/FormationTags";

const FormationHeader = React.memo(function ({ formationDetail }: { formationDetail: FormationDetail }) {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  const { setHeadersSize, resumeCollapse } = useFormationsDetails();
  const refHeader = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);

  const { formationEtablissement, formation, etablissement } = formationDetail;

  useEffect(() => {
    setHeadersSize({ headerHeight: stickyHeaderSize?.height || 0 });
  }, [setHeadersSize, stickyHeaderSize]);

  return (
    <>
      <BoxContainer
        maxWidth={"xl"}
        css={css`
          padding-left: ${fr.spacing("10v")};
        `}
      >
        <PortesOuvertesHeader etablissement={etablissement} />
      </BoxContainer>
      <BoxContainer
        maxWidth={"xl"}
        css={css`
          padding-left: ${fr.spacing("10v")};
        `}
      >
        <Stack spacing={1} direction={"row"}>
          {formation.niveauDiplome && DiplomeTypeLibelle[formation.niveauDiplome] && (
            <TagDiplome>{DiplomeTypeLibelle[formation.niveauDiplome]}</TagDiplome>
          )}
          {etablissement.statut &&
            (etablissement.statut === "public" ? (
              <TagStatutPublic>{capitalize(formatStatut(etablissement))}</TagStatutPublic>
            ) : (
              <TagStatutPrive>{capitalize(formatStatut(etablissement))}</TagStatutPrive>
            ))}
          {formationEtablissement.duree && <TagDuree>{`En ${formationEtablissement.duree}`}</TagDuree>}
          <LabelApprentissage formation={formation} />
          <FormationTags
            withIcon={true}
            tags={formationEtablissement.tags?.filter((tag) => tag === FormationTag.TRANSITION_ECOLOGIQUE) || []}
          />
        </Stack>
      </BoxContainer>
      <BoxContainer
        css={css`
          top: 0;
          position: sticky;
          background-color: #fff;
          z-index: 100;
          display: flex;
        `}
      >
        <BoxContainer
          maxWidth={"xl"}
          css={css`
            padding-left: 2.5rem;
          `}
          ref={refHeader}
        >
          <Typography variant="h1" style={{ marginBottom: fr.spacing("6v"), marginTop: "0.75rem" }}>
            {formatLibelle(formation.libelle)}
          </Typography>
        </BoxContainer>
      </BoxContainer>
      <BoxContainer
        maxWidth={"xl"}
        css={css`
          ${theme.breakpoints.up("md")} {
            top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px)` : 0};
            position: sticky;
          }
          background-color: #fff;
          z-index: 99;
          display: flex;

          visibility: ${resumeCollapse ? "hidden" : "inherit"};
        `}
      >
        <Grid container>
          <Grid item xs={12} md={6} style={{ paddingLeft: fr.spacing("10v") }}>
            <Typography
              variant="h5"
              style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
            >
              {etablissement.url ? (
                <Link
                  css={css`
                    background-image: none;
                    &[href]:hover {
                      background-color: ${fr.colors.decisions.background.alt.grey.default};
                    }
                  `}
                  noIcon
                  target="_blank"
                  href={etablissement.url}
                >
                  {etablissement.libelle}
                  <i
                    className={"fr-icon--sm " + fr.cx("ri-external-link-fill")}
                    style={{ marginLeft: fr.spacing("3v") }}
                  />
                </Link>
              ) : (
                etablissement.libelle
              )}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            css={css`
              ${theme.breakpoints.down("md")} {
                margin-bottom: 0;
              }
              margin-bottom: ${fr.spacing("5v")};
            `}
          >
            <Grid container>
              <Grid item xs={12} md={6} style={{ paddingLeft: fr.spacing("10v") }}>
                <FormationRoute etablissement={etablissement} latitude={latitude} longitude={longitude} />
                <FormationDisponible formationDetail={formationDetail} />
              </Grid>
              <Grid item xs={12} md={6} sx={{ marginTop: { xs: fr.spacing("3v"), md: 0 } }}>
                <Divider
                  variant="middle"
                  margin={"0"}
                  css={css`
                    ${theme.breakpoints.up("md")} {
                      display: none;
                    }
                  `}
                />
                <Box style={{ marginRight: "1rem" }}>
                  <Card
                    actionProps={modalMinistage.buttonProps}
                    css={css`
                      margin-bottom: ${fr.spacing("8v")};
                      ${theme.breakpoints.down("md")} {
                        border: 0;
                        border-radius: 0;
                        margin-bottom: 0;
                        padding-left: ${fr.spacing("2v")};
                      }
                    `}
                  >
                    <Typography
                      variant="subtitle2"
                      style={{ fontWeight: "500", color: "var(--blue-france-sun-113-625-hover)" }}
                    >
                      <i className={fr.cx("fr-icon-calendar-2-line")} style={{ marginRight: fr.spacing("2v") }} />
                      Découvrir la formation lors d’un mini-stage ⓘ
                    </Typography>
                  </Card>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </BoxContainer>

      <BoxContainer
        css={css`
          ${theme.breakpoints.up("md")} {
            position: sticky;
            top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px)` : 0};
            z-index: 100;
            pointer-events: none; /* Fix because height change on sticky cause jumping issue */
          }
        `}
      >
        <Box
          css={css`
            background-color: #fff;
          `}
        >
          <BoxContainer maxWidth={"xl"}>
            <Divider
              variant="middle"
              css={css`
                margin-top: 0;
                margin-bottom: 0;
                ${theme.breakpoints.up("md")} {
                  margin-left: 2.5rem;
                }
              `}
            />
          </BoxContainer>
        </Box>
        <FormationResume formationDetail={formationDetail} />
      </BoxContainer>
    </>
  );
});
FormationHeader.displayName = "FormationHeader";
export default FormationHeader;
