/** @jsxImportSource @emotion/react */
"use client";
import React from "react";
import { css } from "@emotion/react";
import { Box, useTheme } from "@mui/material";
import Container from "#/app/components/Container";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "shared";
import DialogMinistage from "#/app/(accompagnateur)/components/DialogMinistage";
import FormationBlockPoursuite from "./FormationBlock/FormationBlockPoursuite";
import useScrollToLocation from "../../hooks/useScrollToLocation";
import FormationHeader from "./FormationHeader";
import FormationBlockAdmission from "./FormationBlock/FormationBlockAdmission";
import FormationBlockFormation from "./FormationBlock/FormationBlockFormation";
import FormationBlockAccesEmploi from "./FormationBlock/FormationBlockAccesEmploi";
import FormationSimilare from "./FormationSimilaire";
import FormationDetailsProvider, { useFormationsDetails } from "../../context/FormationDetailsContext";
import { createPortal } from "react-dom";

const FormationContent = React.memo(function ({ formationDetail }: { formationDetail: FormationDetail }) {
  const { formation, etablissement } = formationDetail;

  const theme = useTheme();

  const { headersSize } = useFormationsDetails();

  const cssAnchor = css`
    ${theme.breakpoints.up("md")} {
      scroll-margin-top: calc(${headersSize.headerHeight}px + ${headersSize.resumeHeight || 0}px + 2px);
    }
    scroll-margin-top: calc(${headersSize.headerHeight || 0}px + 2px);
  `;

  useScrollToLocation();

  return (
    <Box style={{ marginTop: fr.spacing("5v") }}>
      <FormationHeader formationDetail={formationDetail} />

      <Container
        maxWidth={"xl"}
        style={{ zIndex: 99, position: "relative", backgroundColor: "#fff", marginBottom: "2rem" }}
      >
        <Box
          style={{
            maxWidth: "800px",
            display: "flex",
            flexDirection: "column",
            paddingLeft: fr.spacing("8v"),
            paddingRight: fr.spacing("8v"),
            paddingTop: fr.spacing("10v"),
            gap: "3rem",
          }}
        >
          <FormationBlockFormation
            formationDetail={formationDetail}
            id="la-formation"
            css={cssAnchor}
          ></FormationBlockFormation>

          <FormationBlockAdmission formationDetail={formationDetail} id="l-admission" css={cssAnchor} />

          <FormationBlockPoursuite formation={formation} id="poursuite-etudes" css={cssAnchor} />

          <FormationBlockAccesEmploi
            formationDetail={formationDetail}
            id="acces-emploi"
            css={cssAnchor}
          ></FormationBlockAccesEmploi>
        </Box>
        {createPortal(<DialogMinistage />, document.body)}
      </Container>
      <Box style={{ zIndex: 99, position: "relative" }}>
        <FormationSimilare formationDetail={formationDetail} />
      </Box>
    </Box>
  );
});
FormationContent.displayName = "FormationContent";

const FormationContentWithProvider = React.memo(function ({ formationDetail }: { formationDetail: FormationDetail }) {
  return (
    <FormationDetailsProvider formationDetail={formationDetail}>
      <FormationContent formationDetail={formationDetail} />
    </FormationDetailsProvider>
  );
});
FormationContentWithProvider.displayName = "FormationContentWithProvider";

export default FormationContentWithProvider;
