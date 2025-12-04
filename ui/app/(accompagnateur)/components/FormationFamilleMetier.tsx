/** @jsxImportSource @emotion/react */
import { Box, Typography } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationDetail, FormationFamilleMetierDetail } from "shared";
import "moment/locale/fr";
import { useFormationLink, useSearchFormationLink } from "../hooks/useFormationLink";
import Link from "#/app/components/Link";
import { formatLibelle } from "#/app/utils/formation";
import React, { useMemo } from "react";
import { Grid2 } from "#/app/components/MaterialUINext";
import Button from "#/app/components/Button";
import { useQueryLocation } from "../hooks/useQueryLocation";
import { useGetReverseAddress } from "../hooks/useGetAddress";
import { myPosition } from "#/app/components/form/AddressField";
import {
  ActionContainer,
  ArrowIcon,
  FormationContainer,
  FormationList,
  FormationListItem,
  FormationTitle,
  FormationTitle2,
  SectionTitle,
  StatusIndicator,
  StyledFormationFamilleMetierCard,
} from "./FormationFamilleMetier.styled";

const FAMILLE_METIER_TITLE = {
  bacPro: "Les Bac pro accessibles après cette 2de commune :",
  anneeCommune: "La 2de commune qui permet d'accéder à ce Bac pro :",
};

const FormationFamilleMetierBlock = React.memo(function FormationFamilleMetierBlock({
  formationDetail,
  style = undefined,
  className = undefined,
  address = null,
}: {
  formationDetail: FormationFamilleMetierDetail;
  style?: React.CSSProperties;
  className?: string;
  address?: any;
}) {
  const { formation } = formationDetail;
  const formationLink = useFormationLink({
    formationDetail: formationDetail,
  });

  const formationSearchLink = useSearchFormationLink({
    address: address?.label || myPosition,
    recherche: formation.libelle,
  });

  return (
    <StyledFormationFamilleMetierCard
      link={formationLink || formationSearchLink}
      disableHover={!formationLink}
      linkTarget="_blank"
      style={style}
      className={className}
      type={"formation"}
    >
      <StatusIndicator available={!!formationLink} />
      {formationLink ? (
        <>
          <FormationTitle available variant={"subtitle2"}>
            {formatLibelle(formation.libelle)}
          </FormationTitle>
          <ActionContainer>
            <ArrowIcon className={fr.cx("ri-arrow-right-line")} />
          </ActionContainer>
        </>
      ) : (
        <>
          <FormationTitle variant={"body1"}>{formatLibelle(formation.libelle)}</FormationTitle>
          <ActionContainer>
            <Button variant="blue-france-alt" rounded size="small" iconId="ri-search-line" iconPosition="right">
              Rechercher la formation
            </Button>
          </ActionContainer>
        </>
      )}
    </StyledFormationFamilleMetierCard>
  );
});

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
      <FormationListItem available={false}>
        {formationDetail.formation.libelle} (pas disponible dans cet établissement)
      </FormationListItem>
    );
  }

  return (
    <FormationListItem available>
      {withLink ? (
        <Link noIcon noDecoration onClick={(e) => e.stopPropagation()} href={formationLink} target="_blank">
          {formatLibelle(formationDetail.formation.libelle)}
        </Link>
      ) : (
        formatLibelle(formationDetail.formation.libelle)
      )}
    </FormationListItem>
  );
}

function FormationFamilleMetierBlocks({
  title,
  formationDetail,
  formations,
  withLink = false,
}: {
  title: string;
  formationDetail: FormationDetail;
  formations: FormationFamilleMetierDetail[];
  withLink?: boolean;
}) {
  const location = useQueryLocation();
  const longitude = location.longitude ?? formationDetail.etablissement.longitude ?? 0;
  const latitude = location.latitude ?? formationDetail.etablissement.latitude ?? 0;
  const { data: address } = useGetReverseAddress({ latitude, longitude });

  const formationsInEtablissement = useMemo(
    () => (formations ? formations.filter((detail) => detail.etablissement) : []),
    [formations]
  );
  const formationsNotInEtablissement = useMemo(
    () => (formations ? formations.filter((detail) => !detail.etablissement) : []),
    [formations]
  );

  return (
    <Box>
      <Typography variant="h3">{title}</Typography>
      {formationsInEtablissement.length > 0 && (
        <>
          <SectionTitle variant="h5">Dans l&apos;établissement</SectionTitle>
          <Grid2 container spacing={3}>
            {formationsInEtablissement.map((detail, index) => {
              return (
                <Grid2 xs={12} md={6} key={"formationsFamilleMetier_" + index}>
                  <FormationFamilleMetierBlock formationDetail={detail} address={address} />
                </Grid2>
              );
            })}
          </Grid2>
        </>
      )}

      {formationsNotInEtablissement.length > 0 && (
        <>
          <SectionTitle variant="h5" hasMargin={formationsInEtablissement.length > 0}>
            Non disponible dans cet établissement
          </SectionTitle>
          <Grid2 container spacing={3}>
            {formationsNotInEtablissement.map((detail, index) => {
              return (
                <Grid2 xs={12} md={6} key={"formationsFamilleMetier_" + index}>
                  <FormationFamilleMetierBlock formationDetail={detail} address={address} />
                </Grid2>
              );
            })}
          </Grid2>
        </>
      )}
    </Box>
  );
}

export default function FormationsFamilleMetier({
  formationDetail,
  sx,
  withLink = false,
  small = false,
  anneeCommune = false,
  block = false,
}: {
  formationDetail: FormationDetail;
  sx?: any;
  withLink?: boolean;
  small?: boolean;
  anneeCommune?: boolean;
  block?: boolean;
}) {
  const title = anneeCommune ? FAMILLE_METIER_TITLE.anneeCommune : FAMILLE_METIER_TITLE.bacPro;
  const formations = useMemo(() => {
    return formationDetail.formationsFamilleMetier?.filter((f) => f.formation.isAnneeCommune === anneeCommune);
  }, [anneeCommune, formationDetail]);

  if (!formations || formations.length === 0) {
    return null;
  }

  if (block) {
    return (
      <FormationFamilleMetierBlocks
        title={title}
        formationDetail={formationDetail}
        formations={formations}
        withLink={withLink}
      />
    );
  }

  return (
    <FormationContainer small={small} sx={sx}>
      <FormationTitle2 small={small}>{title}</FormationTitle2>
      <FormationList small={small}>
        {formations.map((detail, index) => {
          return (
            <FormationFamilleMetier
              withLink={withLink}
              key={"formationsFamilleMetier_" + index}
              formationDetail={detail}
            />
          );
        })}
      </FormationList>
    </FormationContainer>
  );
}
