/** @jsxImportSource @emotion/react */
"use client";
import React, { useMemo } from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { useTheme } from "@mui/material";
import { css } from "@emotion/react";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail, FormationVoie } from "#/types/formation";
import useGetFormations from "#/app/(accompagnateur)/hooks/useGetFormations";
import { useFormationLink } from "#/app/(accompagnateur)/hooks/useFormationLink";
import Link from "#/app/components/Link";

export default function FormationDisponible({ formationDetail }: { formationDetail: FormationDetail }) {
  const theme = useTheme();
  const { formation, etablissement, formationEtablissement } = formationDetail;

  const { isLoading, formations } = useGetFormations({
    cfds: [formation.cfd],
    uais: [etablissement.uai],
  });
  const formationAutreVoie =
    formation.voie === FormationVoie.SCOLAIRE ? FormationVoie.APPRENTISSAGE : FormationVoie.SCOLAIRE;

  const autreFormation = useMemo(
    () =>
      formations.find(
        ({ formationEtablissement: fe, formation: f }) =>
          f.voie === formationAutreVoie && fe.duree == formationEtablissement.duree
      ),
    [formations, formation, formationAutreVoie]
  );
  const formationLink = useFormationLink({ formationDetail: autreFormation });

  if (isLoading) {
    return <Loader />;
  }

  return (
    autreFormation &&
    formationLink && (
      <Link noIcon href={formationLink} target="_blank">
        <Typography
          variant={"body2"}
          css={css`
            border-left: 4px solid #6a6af4;
            margin-top: ${fr.spacing("8v")};
            padding-left: ${fr.spacing("8v")};
            ${theme.breakpoints.down("md")} {
              margin-top: 0;
              margin-left: 0;
              margin-bottom: ${fr.spacing("3v")};
            }
          `}
        >
          {formation.voie === FormationVoie.APPRENTISSAGE ? (
            <>Cette formation est aussi disponible en voie scolaire.</>
          ) : (
            <>Cette formation est aussi disponible en alternance.</>
          )}
        </Typography>
      </Link>
    )
  );
}
