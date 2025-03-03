/** @jsxImportSource @emotion/react */
"use client";
import { useCallback, useEffect, useState } from "react";
import { Typography, Grid, Stack, Box, BoxContainer } from "#/app/components/MaterialUINext";
import { FrCxArg, fr } from "@codegouvfr/react-dsfr";
import { Formation, FormationDetail, FormationEtablissement, THRESHOLD_TAUX_PRESSION } from "shared";
import Tag from "#/app/components/Tag";
import { css } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { isNil } from "lodash-es";
import React from "react";
import Divider from "#/app/components/Divider";
import { useScrollspy } from "../../hooks/useScrollSpy";
import { useSize } from "../../hooks/useSize";
import { useFormationsDetails } from "../../context/FormationDetailsContext";
import { Theme, useMediaQuery } from "@mui/material";
import { useHideOnScroll } from "../../hooks/useHideOnScroll";
import { LIBELLE_PRESSION } from "#/app/services/formation";
import FormationResumeBlockEmploi from "./FormationResumeBlockEmploi";
import FormationResumeBlockEtude from "./FormationResumeBlockEtude";

export interface FormationResumeBlockProps {
  title: string;
  icon: FrCxArg;
  children?: JSX.Element | JSX.Element[];
  anchor?: string;
  hideTag?: boolean;
  isActive?: boolean;
}

export function FormationResumeBlock({ title, icon, children, anchor, hideTag, isActive }: FormationResumeBlockProps) {
  const theme = useTheme();
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
              height: 100%;
              cursor: pointer;
              padding-bottom: 24px;
              padding-right: 2rem;

              :hover .resumeUnderline {
                opacity: 100;
              }

              box-shadow: 0px -1px 0px rgb(221, 221, 221) inset;

              ${theme.breakpoints.up("sm")} {
                :hover {
                  color: ${fr.colors.decisions.background.actionHigh.blueFrance.hover};
                  box-shadow: 0px -3px 0px var(--background-action-high-blue-france-hover) inset;
                }
              }

              ${theme.breakpoints.up("md")} {
                ${isActive ? `box-shadow: 0px -3px 0px var(--background-action-high-blue-france-hover) inset;` : ""}
              }
            `
          : null
      }
    >
      <Box
        css={css`
          display: inline-block;
          ${theme.breakpoints.up("md")} {
            color: ${isActive ? `${fr.colors.decisions.background.actionHigh.blueFrance.hover}` : "inherit"};
          }
        `}
      >
        <Typography variant={"body1"}>
          <i className={fr.cx(icon)} style={{ marginRight: fr.spacing("1w") }} />
          {title}
        </Typography>
      </Box>

      {!hideTag && (
        <Stack
          css={css`
            margin-top: 0.8rem;
          `}
          direction={{ sm: "column", md: "column" }}
          spacing={{ xs: fr.spacing("2v"), sm: fr.spacing("2v") }}
        >
          {children}
        </Stack>
      )}
    </Box>
  );
}

function FormationResumeBlockAdmission({
  formationEtablissement,
  formation,
  ...formationResumeBlockProps
}: {
  formationEtablissement: FormationEtablissement;
  formation: Formation;
} & Partial<FormationResumeBlockProps>) {
  const { tauxPression, effectifs, capacite } = formationEtablissement?.indicateurEntree || {};
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression <= THRESHOLD_TAUX_PRESSION[0]
      ? "easy"
      : tauxPression < THRESHOLD_TAUX_PRESSION[1]
      ? "average"
      : "hard";

  return (
    <FormationResumeBlock
      {...formationResumeBlockProps}
      title={"L'admission"}
      icon={"ri-calendar-check-line"}
      anchor="l-admission"
    >
      <>
        {admissionLevel === "easy" && (
          <>
            <Tag square level="easy">
              {LIBELLE_PRESSION["easy"]}
            </Tag>
            {!isNil(effectifs) && !isNil(capacite) && capacite - effectifs > 0 && (
              <Tag square level="easy">
                Places libres l’an dernier
              </Tag>
            )}
          </>
        )}
      </>
      <>
        {admissionLevel === "average" && (
          <Tag square level="average">
            {LIBELLE_PRESSION["average"]}
          </Tag>
        )}
      </>
      <>
        {admissionLevel === "hard" && (
          <Tag square level="hard">
            {LIBELLE_PRESSION["hard"]}
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

const FormationResume = React.memo(function ({
  formationDetail: { formation, formationEtablissement },
  hideTag,
}: {
  formationDetail: FormationDetail;
  hideTag?: boolean;
}) {
  const [currentSection, setCurrentSection] = useState("la-formation");
  const { headersSize } = useFormationsDetails();
  const activeId = useScrollspy(
    ["la-formation", "l-admission", "poursuite-etudes", "acces-emploi"],
    headersSize.headerHeight + headersSize.resumeHeight + 200
  );

  useEffect(() => {
    if (activeId) {
      setCurrentSection(activeId);
    }
  }, [activeId]);

  return (
    <BoxContainer
      maxWidth={"xl"}
      css={css`
        background-color: #fff;
        padding: 1.5rem;
        padding-right: 1rem;
        ${hideTag ? "padding-bottom: 0;" : ""}
      `}
    >
      <Grid
        container
        css={css`
          background-color: #fff;
        `}
        rowSpacing={{ xs: 2, md: 0 }}
      >
        <Grid item xs={12} md={3}>
          <FormationResumeBlock
            hideTag={hideTag}
            title={"La formation"}
            icon={"ri-graduation-cap-line"}
            anchor="la-formation"
            isActive={currentSection === "la-formation"}
          >
            {formation.voie === "scolaire" ? (
              <>
                <Tag square variant="purple-light">
                  En classe et en ateliers
                </Tag>
                <Tag square variant="purple-light">
                  Stages
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
          <FormationResumeBlockAdmission
            hideTag={hideTag}
            formation={formation}
            formationEtablissement={formationEtablissement}
            isActive={currentSection === "l-admission"}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormationResumeBlockEtude
            hideTag={hideTag}
            formation={formation}
            formationEtablissement={formationEtablissement}
            isActive={currentSection === "poursuite-etudes"}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormationResumeBlockEmploi
            hideTag={hideTag}
            formation={formation}
            formationEtablissement={formationEtablissement}
            isActive={currentSection === "acces-emploi"}
          />
        </Grid>
      </Grid>
    </BoxContainer>
  );
});
FormationResume.displayName = "FormationResume";

const FormationResumeHideTagFix = React.memo(function ({ formationDetail }: { formationDetail: FormationDetail }) {
  const theme = useTheme();
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const { headersSize, setHeadersSize, setResumeCollapse } = useFormationsDetails();
  const refResume = React.useRef<HTMLElement>(null);
  const stickyResumeSize = useSize(refResume);
  const hideonScroll = useHideOnScroll(refResume, headersSize.headerHeight + 2);
  const hideResumeTag = isDownSm ? undefined : hideonScroll;

  useEffect(() => {
    setHeadersSize({ resumeHeight: stickyResumeSize?.height || 0 });
  }, [setHeadersSize, stickyResumeSize]);

  useEffect(() => {
    setResumeCollapse(hideResumeTag);
  }, [hideResumeTag]);

  return (
    <BoxContainer>
      <Box style={{ display: "grid", gridTemplateColumns: "1fr" }}>
        <Box style={{ gridRowStart: 1, gridColumnStart: 1 }}>
          <Box
            css={css`
              background-color: #fff;
            `}
          >
            <BoxContainer
              maxWidth={"xl"}
              css={css`
                pointer-events: auto;
              `}
            >
              <Box
                css={css`
                  padding-left: 1rem;
                `}
              >
                <FormationResume formationDetail={formationDetail} hideTag={hideResumeTag} />
              </Box>
            </BoxContainer>
          </Box>
        </Box>
        <Box style={{ gridRowStart: 1, gridColumnStart: 1, visibility: "hidden" }}>
          <BoxContainer
            maxWidth={"xl"}
            css={css`
              pointer-events: auto;
              ${theme.breakpoints.up("md")} {
                padding-left: 1.25rem;
              }
            `}
            ref={refResume}
          >
            {hideResumeTag !== undefined && <FormationResume hideTag={true} formationDetail={formationDetail} />}
          </BoxContainer>
        </Box>
        <Box style={{ gridRowStart: 1, gridColumnStart: 1, visibility: "hidden" }}>
          <FormationResume formationDetail={formationDetail} />
        </Box>
      </Box>
    </BoxContainer>
  );
});
FormationResumeHideTagFix.displayName = "FormationResumeHideTagFix";

export default FormationResumeHideTagFix;
