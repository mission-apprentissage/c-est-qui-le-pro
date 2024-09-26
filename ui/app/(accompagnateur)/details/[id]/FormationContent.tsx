/** @jsxImportSource @emotion/react */
"use client";
import React from "react";
import { css } from "@emotion/react";
import { Box, useTheme } from "@mui/material";
import { Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "#/types/formation";
import { useSize } from "#/app/(accompagnateur)/hooks/useSize";
import DialogMinistage from "#/app/(accompagnateur)/components/DialogMinistage";
import FormationBlockPoursuite from "./FormationBlockPoursuite";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import FormationHeader from "./FormationHeader";
import FormationBlockAdmission from "./FormationBlockAdmission";
import FormationBlockFormation from "./FormationBlockFormation";
import FormationBlockAccesEmploi from "./FormationBlockAccesEmploi";
import FormationSimilare from "./FormationSimilaire";

export default function FormationContent({ formationDetail }: { formationDetail: FormationDetail }) {
  const { formation, etablissement } = formationDetail;

  const theme = useTheme();

  const refHeader = React.useRef<HTMLElement>(null);
  const refResume = React.useRef<HTMLElement>(null);
  const stickyHeaderSize = useSize(refHeader);
  const stickyResumeSize = useSize(refResume);

  const cssAnchor = css`
    ${theme.breakpoints.up("md")} {
      scroll-margin-top: calc(${stickyHeaderSize?.height || 0}px + ${stickyResumeSize?.height || 0}px + 1rem);
    }
    scroll-margin-top: calc(${stickyHeaderSize?.height || 0}px + 1rem);
  `;

  useScrollToLocation();

  return (
    <Box style={{ marginTop: fr.spacing("5v") }}>
      <FormationHeader refHeader={refHeader} refResume={refResume} formationDetail={formationDetail} />

      <Container maxWidth={"xl"}>
        <Grid container>
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
              <FormationBlockFormation
                formation={formation}
                etablissement={etablissement}
                id="la-formation"
                css={cssAnchor}
                style={{ marginBottom: "2rem" }}
              ></FormationBlockFormation>

              <FormationBlockAdmission
                formationDetail={formationDetail}
                id="l-admission"
                css={cssAnchor}
                style={{ marginBottom: "2rem" }}
              />

              <FormationBlockPoursuite
                formation={formation}
                id="poursuite-etudes"
                css={cssAnchor}
                style={{ marginBottom: "2rem" }}
              />

              <FormationBlockAccesEmploi
                formation={formation}
                etablissement={etablissement}
                id="acces-emploi"
                css={cssAnchor}
              ></FormationBlockAccesEmploi>
            </Grid>
          </Grid>
        </Grid>
        <DialogMinistage />
      </Container>
      <FormationSimilare formationDetail={formationDetail} />
    </Box>
  );
}
