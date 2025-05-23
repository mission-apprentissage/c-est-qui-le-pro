/** @jsxImportSource @emotion/react */
"use client";
import React, { useMemo } from "react";
import { useTheme } from "@mui/material";
import { css } from "@emotion/react";
import { Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "shared";
import { formatPortesOuvertes } from "#/app/(accompagnateur)/components/PortesOuvertes";
import Link from "#/app/components/Link";

const PortesOuvertesHeader = React.memo(({ etablissement }: { etablissement: Etablissement }) => {
  const theme = useTheme();
  const strPortesOuvertes = useMemo(() => formatPortesOuvertes(etablissement), [etablissement]);
  const url = etablissement?.onisepId
    ? `https://www.onisep.fr/http/redirection/etablissement/slug/${etablissement.onisepId}#events`
    : null;

  const title = strPortesOuvertes ? (
    <Typography
      variant="subtitle1"
      css={css`
        ${theme.breakpoints.up("md")} {
          border-radius: 4px;
        }
        font-weight: 500;
        color: ${strPortesOuvertes.ended ? "#3A3A3A" : "#fff"};
        background-color: ${strPortesOuvertes.ended ? "var(--background-contrast-grey)" : "#1212FF"};
        padding: ${fr.spacing("4v")};
        padding-left: ${fr.spacing("6v")};
        padding-right: ${fr.spacing("6v")};
        margin-bottom: ${fr.spacing("10v")};
      `}
    >
      <i className={fr.cx("fr-icon-calendar-2-line")} style={{ marginRight: fr.spacing("4v") }} />
      {strPortesOuvertes.str}
      <i className={fr.cx("fr-icon-arrow-right-line")} style={{ marginLeft: fr.spacing("4v") }} />
    </Typography>
  ) : null;

  return strPortesOuvertes ? (
    url ? (
      <Link href={url} target="_blank" noIcon>
        {title}
      </Link>
    ) : (
      title
    )
  ) : (
    <></>
  );
});

PortesOuvertesHeader.displayName = "PortesOuvertesHeader";

export default PortesOuvertesHeader;
