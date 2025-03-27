import { JSX, useState } from "react";
import styled from "@emotion/styled";
import { Collapse, Grid } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

const ButtonDiv = styled.div`
  :hover {
    cursor: pointer;
  }
`;

export default function CustomAccordion({
  label,
  children,
  defaultExpanded = false,
}: {
  label: JSX.Element;
  children: JSX.Element | JSX.Element[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  //TODO: add aria control
  return (
    <div>
      <ButtonDiv onClick={() => setExpanded(!expanded)}>
        <Grid container>
          <Grid item xs={11}>
            {label}
          </Grid>
          <Grid item xs={1} paddingTop={"0.5rem"}>
            {expanded ? (
              <i className={fr.cx("fr-icon-arrow-up-s-line")} />
            ) : (
              <i className={fr.cx("fr-icon-arrow-down-s-line")} />
            )}
          </Grid>
        </Grid>
      </ButtonDiv>
      <Collapse in={expanded}>{children}</Collapse>
    </div>
  );
}
