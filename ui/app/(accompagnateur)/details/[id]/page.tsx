/** @jsxImportSource @emotion/react */
"use client";
import React, { Suspense, useState } from "react";
import { css } from "@emotion/react";
import { Box, Stack, useTheme } from "@mui/material";
import HtmlReactParser from "html-react-parser";
import TruncateMarkup from "react-truncate-markup";
import { useQuery } from "@tanstack/react-query";
import { Typography, Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { formation } from "#/app/queries/formation/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { notFound, useSearchParams } from "next/navigation";
import { FormationDetail } from "#/types/formation";
import Divider from "#/app/components/Divider";
import Card from "#/app/components/Card";
import PortesOuvertesHeader from "./PortesOuvertesHeader";
import WidgetInserJeunes from "#/app/(accompagnateur)/components/WidgetInserJeunes";
import FormationResume from "./FormationResume";
import WidgetSiriusEtablissement from "#/app/(accompagnateur)/components/WidgetSiriusEtablissement";
import { TagStatut, TagDuree } from "#/app/components/Tag";
import { useSize } from "#/app/(accompagnateur)/hooks/useSize";
import DialogMinistage, { modalMinistage } from "#/app/(accompagnateur)/components/DialogMinistage";
import FormationRoute from "./FormationRoute";
import FormationDisponible from "./FormationDisponible";
import Link from "#/app/components/Link";
import Title from "#/app/(accompagnateur)/components/Title";
import { TagApprentissage } from "#/app/(accompagnateur)/components/Apprentissage";
import { capitalize } from "lodash-es";

function FormationDetails({ formationDetail }: { formationDetail: FormationDetail }) {
  const { formationEtablissement, formation, etablissement } = formationDetail;
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  const theme = useTheme();

  const refHeader = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);

  const [descriptionLine, setDescriptionLine] = useState(6);

  return (
    <Container style={{ marginTop: fr.spacing("5v") }} maxWidth={"xl"}>
      <Grid container>
        <Grid item xs={12}>
          <PortesOuvertesHeader etablissement={etablissement} />
        </Grid>
        <Grid
          item
          xs={12}
          css={css`
            top: 0;
            position: sticky;
            background-color: #fff;
            z-index: 100;
          `}
          style={{ paddingLeft: fr.spacing("5v") }}
        >
          <Typography ref={refHeader} variant="h1" style={{ marginBottom: fr.spacing("6v") }}>
            {capitalize(formation.libelle)}
          </Typography>
        </Grid>
        <Grid
          item
          xs={12}
          css={css`
            ${theme.breakpoints.up("md")} {
              top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px + ${fr.spacing("3v")})` : 0};
              position: sticky;
            }
            background-color: #fff;
            z-index: 99;
          `}
        >
          <Grid container>
            <Grid item xs={12} style={{ paddingLeft: fr.spacing("5v"), marginBottom: fr.spacing("3v") }}>
              <Stack spacing={1} direction={"row"}>
                {etablissement.statut && <TagStatut square>{etablissement.statut.toUpperCase()}</TagStatut>}
                {formationEtablissement.duree && (
                  <TagDuree square>{`En ${formationEtablissement.duree}`.toUpperCase()}</TagDuree>
                )}
                <TagApprentissage formation={formation} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6} style={{ paddingLeft: fr.spacing("5v") }}>
              <Typography
                variant="h5"
                style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
              >
                {etablissement.url ? (
                  <Link style={{ backgroundImage: "none" }} noIcon target="_blank" href={etablissement.url}>
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
                <Grid item xs={12} md={6} style={{ paddingLeft: fr.spacing("5v") }}>
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
                    <Typography variant="subtitle2" style={{ color: "var(--blue-france-sun-113-625-hover)" }}>
                      <i className={fr.cx("fr-icon-calendar-2-line")} style={{ marginRight: fr.spacing("2v") }} />
                      Découvrir la formation lors d’un mini-stage ⓘ
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid
          item
          md={12}
          css={css`
            ${theme.breakpoints.up("md")} {
              position: sticky;
              top: ${stickyHeaderSize ? `calc(${stickyHeaderSize.height}px + ${fr.spacing("3v")})` : 0};
              z-index: 100;
            }
            background-color: #fff;
          `}
        >
          <Divider variant="middle" style={{ marginTop: 0, marginBottom: 0 }} />
          <FormationResume formationDetail={formationDetail} />
          <Divider
            variant="middle"
            style={{
              marginBottom: 0,
            }}
          />
        </Grid>
        <Grid item xs={12} style={{ backgroundColor: "#fff", zIndex: 99 }}>
          <Grid
            container
            style={{
              maxWidth: "800px",
              paddingLeft: fr.spacing("8v"),
              paddingRight: fr.spacing("8v"),
              paddingTop: fr.spacing("10v"),
            }}
          >
            {formation.description && (
              <Grid item xs={12}>
                <Card type="details" title="La formation">
                  <Box
                    style={{
                      border: "1px solid #DDDDDD",
                      padding: "1rem",
                      paddingBottom: "1.5rem",
                      paddingTop: "1.5rem",
                    }}
                  >
                    <TruncateMarkup
                      lineHeight={24}
                      lines={descriptionLine}
                      tokenize={"words"}
                      ellipsis={
                        <>
                          {"..."}
                          <div style={{ marginTop: "-1.5rem" }}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setDescriptionLine(1000);
                              }}
                            >
                              Voir plus
                            </a>
                          </div>
                        </>
                      }
                    >
                      <div>{HtmlReactParser(formation.description)}</div>
                    </TruncateMarkup>
                    <Box style={{ marginTop: "2rem" }}>
                      <Link
                        style={{ color: "var(--blue-france-sun-113-625)" }}
                        target="_blank"
                        href={`https://www.onisep.fr/http/redirection/formation/slug/${formation?.onisepIdentifiant}`}
                      >
                        En savoir plus, sur le site de l&apos;Onisep
                      </Link>
                    </Box>
                  </Box>
                </Card>

                {formation.voie === "apprentissage" && (
                  <Box style={{ marginTop: fr.spacing("10v") }}>
                    <WidgetSiriusEtablissement etablissement={etablissement} fallbackComponent={<></>} />
                  </Box>
                )}
              </Grid>
            )}

            <Grid item xs={12} style={{ marginTop: fr.spacing("5v") }}>
              <Card type="details" title="L’accès à l’emploi">
                <Typography variant="h3">Que deviennent les élèves après ce CAP ?</Typography>
                <WidgetInserJeunes etablissement={etablissement} formation={formation} />
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <DialogMinistage />
    </Container>
  );
}

function ResearchFormationResult({ id }: { id: string }) {
  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", id],
    queryFn: ({ signal }) => {
      return formation({ id: id }, { signal });
    },
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    <>
      <Title
        pageTitle={`Détails de la formation ${data.formation.libelle} dans l'établissement ${data.etablissement.libelle}`}
      />
      <FormationDetails formationDetail={data} />
    </>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Suspense>
        <ResearchFormationResult id={params.id} />
      </Suspense>
    </>
  );
}