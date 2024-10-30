/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Box, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail } from "shared";
import "moment/locale/fr";
import { useFormationLink } from "../hooks/useFormationLink";
import Link from "#/app/components/Link";

function FormationFamilleMetier({
  formationDetail,
  latitude,
  longitude,
  noLink = true,
}: {
  formationDetail: FormationDetail;
  latitude: number;
  longitude: number;
  noLink?: boolean;
}) {
  const formationLink = useFormationLink({
    formationDetail: formationDetail,
    longitude: longitude.toString(),
    latitude: latitude.toString(),
  });

  if (!formationLink) {
    return <li>{formationDetail.formation.libelle}</li>;
  }

  return (
    <li
      css={css`
        &::marker {
          color: ${fr.colors.options.success._425_625.active};
        }
        margin-left: 0.6rem;
        color: ${fr.colors.decisions.artwork.major.blueFrance.default};
        font-weight: 700;
        font-size: 0.875rem;
        line-height: 1.5rem;
      `}
    >
      {noLink ? (
        formationDetail.formation.libelle
      ) : (
        <Link
          noIcon
          noDecoration
          onClick={(e) => e.stopPropagation()}
          href={formationLink}
          target="_blank"
          css={css`
            &[href]:hover {
              background-color: ${fr.colors.decisions.background.default.grey.default};
            }
          `}
        >
          {formationDetail.formation.libelle}
        </Link>
      )}
    </li>
  );
}

export default function FormationsFamilleMetier({
  formationDetail,
  latitude,
  longitude,
}: {
  formationDetail: FormationDetail;
  latitude: number;
  longitude: number;
}) {
  if (!formationDetail.formationsFamilleMetier || formationDetail.formationsFamilleMetier.length === 0) {
    return;
  }

  return (
    <Box
      sx={{
        marginTop: "0.75rem",
        backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
        padding: "0.5rem 0.75rem",
        paddingBottom: "1.25rem",
        borderTop: "1px solid " + fr.colors.decisions.border.default.grey.default,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        Liste des BAC PRO accessible après cette 2nd Pro :
      </Typography>
      <ul
        css={css`
          margin: 0;
        `}
      >
        {formationDetail.formationsFamilleMetier?.map((detail, index) => {
          return (
            <FormationFamilleMetier
              key={"formationsFamilleMetier_" + index}
              longitude={longitude}
              latitude={latitude}
              formationDetail={detail}
            />
          );
        })}
      </ul>
    </Box>
  );
}
