/** @jsxImportSource @emotion/react */
"use client";
import { useCallback } from "react";
import { Typography, Grid, Stack, Box } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { FrCxArg, fr } from "@codegouvfr/react-dsfr";
import { Formation, FormationDetail, FormationEtablissement } from "#/types/formation";
import Tag from "#/app/components/Tag";
import {
  THRESHOLD_TAUX_PRESSION,
  THRESHOLD_EN_EMPLOI,
  THRESHOLD_EN_ETUDE,
} from "#/app/(accompagnateur)/constants/constants";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";

function FormationResumeBlock({
  title,
  icon,
  children,
  anchor,
}: {
  title: string;
  icon: FrCxArg;
  children?: JSX.Element | JSX.Element[];
  anchor?: string;
}) {
  const { push } = useRouter();
  const anchorCb = useCallback(() => {
    if (!anchor) {
      return;
    }
    push("#" + anchor, { scroll: false });
  }, [anchor, push]);

  return (
    <Box
      onClick={anchorCb}
      css={
        anchor
          ? css`
              cursor: pointer;
              :hover .resumeUnderline {
                opacity: 100;
              }
            `
          : null
      }
    >
      <Box
        css={css`
          display: inline-block;
          margin-bottom: 0.8rem;
        `}
      >
        <Typography variant={"body1"}>
          <i className={fr.cx(icon)} style={{ marginRight: fr.spacing("1w") }} />
          {title}
        </Typography>
        {anchor && (
          <Box
            className="resumeUnderline"
            css={css`
              border-top: 3px solid black;
              margin-top: 0.25rem;
              opacity: 0;
            `}
          ></Box>
        )}
      </Box>

      <Stack direction={{ sm: "column", md: "column" }} spacing={{ xs: fr.spacing("2v"), sm: fr.spacing("2v") }}>
        {children}
      </Stack>
    </Box>
  );
}

function FormationResumeBlockAdmission({
  formationEtablissement,
  formation,
}: {
  formationEtablissement: FormationEtablissement;
  formation: Formation;
}) {
  const tauxPression = formationEtablissement?.indicateurEntree?.tauxPression;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression <= THRESHOLD_TAUX_PRESSION[0]
      ? "easy"
      : tauxPression < THRESHOLD_TAUX_PRESSION[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"L'admission"} icon={"ri-calendar-check-line"} anchor="l-admission">
      <>
        {admissionLevel === "easy" && (
          <>
            <Tag square level="easy">
              Facile
            </Tag>
            <Tag square level="easy">
              Nombreuses places
            </Tag>
          </>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Peu facile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Très sélective
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" &&
          (formation.voie === "scolaire" ? (
            <Tag square level="unknow">
              Difficulté d&apos;intégration indisponible
            </Tag>
          ) : (
            <Tag square level="unknow">
              Nécessite de trouver une entreprise
            </Tag>
          ))}
      </>
    </FormationResumeBlock>
  );
}

function FormationResumeBlockEmploi({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxPression = formationEtablissement?.indicateurPoursuite?.taux_en_emploi_6_mois;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression >= THRESHOLD_EN_EMPLOI[0]
      ? "easy"
      : tauxPression > THRESHOLD_EN_EMPLOI[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"L'accès à l'emploi"} icon={"ri-briefcase-4-line"} anchor="acces-emploi">
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très favorable
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Dans la moyenne
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Plutôt difficile
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux d’emploi indisponible
          </Tag>
        )}
      </>
    </FormationResumeBlock>
  );
}

function FormationResumeBlockEtude({ formationEtablissement }: { formationEtablissement: FormationEtablissement }) {
  const tauxPression = formationEtablissement?.indicateurPoursuite?.taux_en_formation;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression >= THRESHOLD_EN_ETUDE[0]
      ? "easy"
      : tauxPression > THRESHOLD_EN_ETUDE[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock title={"La poursuite d'études"} icon={"ri-sun-line"} anchor={"poursuite-etudes"}>
      <>
        {admissionLevel === "easy" && (
          <Tag square level="easy">
            Très souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            Souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            Peu souvent
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "unknow" && (
          <Tag square level="unknow">
            Taux de poursuite d’études indisponible
          </Tag>
        )}
      </>
    </FormationResumeBlock>
  );
}

export default function FormationResume({
  formationDetail: { formation, formationEtablissement },
}: {
  formationDetail: FormationDetail;
}) {
  const theme = useTheme();

  return (
    <Container
      maxWidth={false}
      css={css`
        background-color: #fff;
        ${theme.breakpoints.down("md")} {
          padding-left: ${fr.spacing("5v")};
        }
      `}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormationResumeBlock title={"La formation"} icon={"ri-graduation-cap-line"} anchor="la-formation">
            {formation.voie === "scolaire" ? (
              <>
                <Tag square variant="purple-light">
                  En classe et en atelier
                </Tag>
                <Tag square variant="purple-light">
                  Stage
                </Tag>
              </>
            ) : (
              <>
                <Tag square variant="purple-light">
                  En entreprise et en classe
                </Tag>
                <Tag square variant="purple-light">
                  Salariat
                </Tag>
              </>
            )}
          </FormationResumeBlock>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormationResumeBlockAdmission formation={formation} formationEtablissement={formationEtablissement} />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormationResumeBlockEtude formationEtablissement={formationEtablissement} />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormationResumeBlockEmploi formationEtablissement={formationEtablissement} />
        </Grid>
      </Grid>
    </Container>
  );
}
