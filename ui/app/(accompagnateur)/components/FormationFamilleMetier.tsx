/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { Box, SxProps, Theme, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail, FormationFamilleMetierDetail } from "shared";
import "moment/locale/fr";
import { useFormationLink } from "../hooks/useFormationLink";
import Link from "#/app/components/Link";
import { useMemo } from "react";
import { formatLibelle } from "#/app/utils/formation";

function FormationFamilleMetier({
  formationDetail,
  withLink = false,
}: {
  formationDetail: FormationFamilleMetierDetail;
  withLink?: boolean;
}) {
  const formationLink = useFormationLink({
    formationDetail: formationDetail,
  });

  if (!formationLink) {
    return (
      <li
        css={css`
          &::marker {
            color: ${fr.colors.options.warning._425_625.active};
          }
          margin-left: 0.6rem;
        `}
      >
        {formationDetail.formation.libelle} (pas disponible dans cet établissement)
      </li>
    );
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
      `}
    >
      {withLink ? (
        <Link noIcon noDecoration onClick={(e) => e.stopPropagation()} href={formationLink} target="_blank">
          {formatLibelle(formationDetail.formation.libelle)}
        </Link>
      ) : (
        formatLibelle(formationDetail.formation.libelle)
      )}
    </li>
  );
}

export default function FormationsFamilleMetier({
  formationDetail,
  sx,
  withLink = false,
  small = false,
  anneeCommune = false,
}: {
  formationDetail: FormationDetail;
  sx?: SxProps<Theme>;
  withLink?: boolean;
  small?: boolean;
  anneeCommune?: boolean;
}) {
  const formations = useMemo(() => {
    return formationDetail.formationsFamilleMetier?.filter((f) => f.formation.isAnneeCommune === anneeCommune);
  }, [formationDetail]);

  if (!formations || formations.length === 0) {
    return;
  }

  return (
    <Box
      sx={{
        backgroundColor: fr.colors.decisions.background.alt.blueFrance.default,
        padding: "0.5rem 0.75rem",
        ...sx,
      }}
    >
      <Typography
        sx={{ fontSize: small ? "0.875rem" : "1rem", fontWeight: 500, paddingBottom: small ? "0.25rem" : "0.5rem" }}
      >
        {anneeCommune
          ? "La 2de commune qui permet d’accéder à ce Bac pro :"
          : "Les Bac pro accessibles après cette 2de commune :"}
      </Typography>
      <ul
        css={css`
          margin: 0;
          & li {
            font-size: ${small ? "1rem" : "1.125rem"};
            line-height: ${small ? "1.5rem" : "1.75rem"};
            padding-bottom: 0;
          }

          & li:not(:last-child) {
            margin-bottom: ${small ? "0.25rem" : "0.25rem"};
          }
        `}
      >
        {formations.map((detail, index) => {
          return (
            <FormationFamilleMetier
              withLink={withLink}
              key={"formationsFamilleMetier_" + index}
              formationDetail={detail}
            />
          );
        })}
      </ul>
    </Box>
  );
}
