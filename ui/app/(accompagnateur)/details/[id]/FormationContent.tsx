/** @jsxImportSource @emotion/react */
"use client";
import React from "react";
import { css } from "@emotion/react";
import { Box, useTheme } from "@mui/material";
import { Grid } from "#/app/components/MaterialUINext";
import Container from "#/app/components/Container";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "shared";
import DialogMinistage from "#/app/(accompagnateur)/components/DialogMinistage";
import FormationBlockPoursuite from "./FormationBlockPoursuite";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import FormationHeader from "./FormationHeader";
import FormationBlockAdmission from "./FormationBlockAdmission";
import FormationBlockFormation from "./FormationBlockFormation";
import FormationBlockAccesEmploi from "./FormationBlockAccesEmploi";
import FormationSimilare from "./FormationSimilaire";
import FormationDetailsHeaderProvider, {
  useFormationsDetailsHeadersSize,
} from "../../context/FormationDetailsHeaderContext";

const FormationContent = React.memo(function ({ formationDetail }: { formationDetail: FormationDetail }) {
  const { formation, etablissement } = formationDetail;

  const theme = useTheme();

  const { headersSize } = useFormationsDetailsHeadersSize();

  const cssAnchor = css`
    ${theme.breakpoints.up("md")} {
      scroll-margin-top: calc(${headersSize.headerHeight}px + ${headersSize.resumeHeight || 0}px);
    }
    scroll-margin-top: calc(${headersSize.headerHeight || 0}px);
  `;

  useScrollToLocation();

  return (
    <Box style={{ marginTop: fr.spacing("5v") }}>
      <FormationHeader formationDetail={formationDetail} />

      <Container maxWidth={"xl"} style={{ zIndex: 99, position: "relative" }}>
        <Grid container>
          <Grid item xs={12} style={{ backgroundColor: "#fff" }}>
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
                formationDetail={formationDetail}
                id="la-formation"
                css={cssAnchor}
                style={{ marginBottom: "0.5rem" }}
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
                style={{ marginBottom: "0.5rem" }}
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
      <Box style={{ zIndex: 99, position: "relative" }}>
        <FormationSimilare formationDetail={formationDetail} />
      </Box>
    </Box>
  );
});
FormationContent.displayName = "FormationContent";

const FormationContentWithHeaderProvider = React.memo(function ({
  formationDetail,
}: {
  formationDetail: FormationDetail;
}) {
  return (
    <FormationDetailsHeaderProvider>
      <FormationContent formationDetail={formationDetail} />
    </FormationDetailsHeaderProvider>
  );
});
FormationContentWithHeaderProvider.displayName = "FormationContentWithHeaderProvider";

export default FormationContentWithHeaderProvider;
