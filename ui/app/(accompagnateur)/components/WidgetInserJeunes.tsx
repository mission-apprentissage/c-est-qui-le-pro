/** @jsxImportSource @emotion/react */
"use client";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { Theme, useMediaQuery } from "@mui/material";
import { useMemo } from "react";
import { Etablissement, FormationDetail, IndicateurPoursuite, IndicateurPoursuiteAnneeCommune } from "shared";
import UnionIcon from "#/app/components/icon/UnionIcon";
import { fr } from "@codegouvfr/react-dsfr";
import { formatMillesime } from "#/app/utils/formation";
import { BlueLink, FlexCenterColumnBox } from "./InserJeunes.styled";
import { DialogInserjeunesEmploi, DialogInserjeunesFormation, DialogInserjeunesAutres } from "./DialogInserjeunes";
import { createPortal } from "react-dom";
import CustomAccordion from "#/app/components/Accordion";
import { computeTaux, WIDGET_INSERJEUNES_TYPE, WidgetInserjeunesTypeMetrics } from "#/app/services/inserjeunes";
import {
  modalInserjeunesEmploi,
  modalInserjeunesAutres,
  modalInserjeunesFormation,
} from "#/app/(accompagnateur)/components/DialogInserjeunes";
import { capitalize } from "lodash-es";
import {
  AccordionContainer,
  AllPersonasContainer,
  ContainerAnneeCommune,
  ContainerFormation,
  Description,
  DescriptionContainer,
  ErrorContainer,
  ErrorList,
  IndicateursContainer,
  PersonaContainer,
  PersonasContainer,
  StyledDivider,
  StyledEtablissementLibelle,
  StyledFormationLibelle,
  StyledTitle,
} from "./WidgetInserJeunes.styled";

function NoIndicateurs() {
  return (
    <ErrorContainer>
      <Typography variant="body4">Oups, nous n&apos;avons pas cette information.</Typography>
      <Typography variant="body4" fontWeight={"700"}>
        2 cas sont possibles :
      </Typography>
      <Box>
        <ErrorList>
          <Typography variant="body4" fontWeight={"700"}>
            1.
          </Typography>
          <Typography variant="body4">
            <b>NOUVELLE FORMATION :</b> cette formation vient d&apos;être créée. Nous aurons donc les résultats plus
            tard, lorsqu&apos;une première promotion aura fini la formation.
          </Typography>
        </ErrorList>
        <ErrorList>
          <Typography variant="body4" fontWeight={"700"}>
            2.
          </Typography>
          <Typography variant="body4">
            <b>FORMATION NON DISPONIBLE :</b> l&apos;établissement ne propose pas cette formation.
          </Typography>
        </ErrorList>
      </Box>
    </ErrorContainer>
  );
}

function IndicateursSousSeuil() {
  return (
    <ErrorContainer>
      <Typography variant="body4">Oups, nous n&apos;avons pas cette information.</Typography>
      <Typography variant="body4">
        Il y a aujourd&apos;hui un petit nombre d&apos;élèves dans cette spécialité. Nous ne pouvons pas faire des
        statistiques fiables sur seulement quelques individus, cela risquerait de fournir de mauvaises informations.
      </Typography>
    </ErrorContainer>
  );
}

export function Persona({ type }: { type: WidgetInserjeunesTypeMetrics }) {
  const metric = WIDGET_INSERJEUNES_TYPE[type];
  return (
    <PersonaContainer>
      <UnionIcon color={metric.colorIcon} />
      <i className={fr.cx(metric.icon)}></i>
    </PersonaContainer>
  );
}

function IndicateursWithPersona({ indicateurPoursuite }: { indicateurPoursuite: IndicateurPoursuite }) {
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("sm"));
  const nbEleves = useMemo(() => computeTaux(indicateurPoursuite), [indicateurPoursuite]);
  const metrics: { [key in WidgetInserjeunesTypeMetrics]: number } = {
    emploi: nbEleves.emploi.eleves,
    formation: nbEleves.formation.eleves,
    autres: nbEleves.autres.eleves,
  };
  const modals = {
    emploi: modalInserjeunesEmploi,
    formation: modalInserjeunesFormation,
    autres: modalInserjeunesAutres,
  };

  return (
    <IndicateursContainer>
      <AllPersonasContainer vertical={isDownSm}>
        {Object.keys(WIDGET_INSERJEUNES_TYPE).map((key) => {
          const keyTyped = key as WidgetInserjeunesTypeMetrics;
          const metric = WIDGET_INSERJEUNES_TYPE[keyTyped];
          return (
            <Box key={`indicateur_${key}`}>
              <PersonasContainer>
                {Array.from({ length: metrics[keyTyped] }, (_, i) => (
                  <Persona key={`${key}_${i}`} type={keyTyped} />
                ))}
              </PersonasContainer>
              {isDownSm && (
                <Description color={metric.color} vertical={isDownSm} onClick={modals[keyTyped].open}>
                  <Box>{indicateurPoursuite[metric.metric]}%</Box>
                  <Box>
                    <Box>{metric.description}</Box>
                    <i className={fr.cx("ri-information-line")}></i>
                  </Box>
                </Description>
              )}
            </Box>
          );
        })}
      </AllPersonasContainer>
      {!isDownSm && (
        <DescriptionContainer>
          {Object.keys(WIDGET_INSERJEUNES_TYPE).map((key) => {
            const keyTyped = key as WidgetInserjeunesTypeMetrics;
            const metric = WIDGET_INSERJEUNES_TYPE[keyTyped];
            return (
              <Description key={`indicateur_desription_${key}`} color={metric.color} onClick={modals[keyTyped].open}>
                <Box>{indicateurPoursuite[metric.metric]}%</Box>
                <Box>
                  <Box>
                    <i className={fr.cx(metric.icon)}></i>
                    {metric.description}
                  </Box>
                  <i className={fr.cx("ri-information-line")}></i>
                </Box>
              </Description>
            );
          })}
        </DescriptionContainer>
      )}
    </IndicateursContainer>
  );
}

function WidgetInserJeunesFormation({ indicateurPoursuite }: { indicateurPoursuite?: IndicateurPoursuite }) {
  return (
    <Box>
      {!indicateurPoursuite ? (
        <NoIndicateurs />
      ) : !indicateurPoursuite?.taux_en_formation ? (
        <IndicateursSousSeuil />
      ) : (
        <IndicateursWithPersona indicateurPoursuite={indicateurPoursuite} />
      )}
    </Box>
  );
}

function WidgetInserJeunesFamilleMetier({
  etablissement,
  indicateurPoursuiteAnneeCommune,
}: {
  etablissement: Etablissement;
  indicateurPoursuiteAnneeCommune?: IndicateurPoursuiteAnneeCommune[];
}) {
  const hasStats = !!indicateurPoursuiteAnneeCommune?.length;

  if (!hasStats) {
    return null;
  }

  return (
    <Box>
      {!hasStats && <NoIndicateurs />}
      {hasStats && (
        <Box>
          {indicateurPoursuiteAnneeCommune.map((indicateurPoursuite, index) => {
            return (
              <Box key={`poursuite_anneee_commune_${index}`}>
                <CustomAccordion
                  defaultExpanded={indicateurPoursuite.part_en_emploi_6_mois !== undefined}
                  label={
                    <StyledFormationLibelle
                      variant="subtitle1"
                      active={indicateurPoursuite.part_en_emploi_6_mois !== undefined}
                    >
                      {index + 1}. Après {capitalize(indicateurPoursuite.libelle)}
                    </StyledFormationLibelle>
                  }
                >
                  <AccordionContainer>
                    <WidgetInserJeunesFormation indicateurPoursuite={indicateurPoursuite} />
                  </AccordionContainer>
                </CustomAccordion>

                <StyledDivider active={indicateurPoursuite.part_en_emploi_6_mois !== undefined} />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function EtablissementLibelle({ etablissement }: { etablissement: Etablissement }) {
  return (
    <StyledEtablissementLibelle>
      <i className={fr.cx("ri-map-pin-2-line")}></i>
      {etablissement.libelle}
    </StyledEtablissementLibelle>
  );
}

function WidgetFooter({ millesime }: { millesime: string }) {
  return (
    <FlexCenterColumnBox>
      <Typography variant="body3">
        Données issues du dispositif{" "}
        <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
          InserJeunes
        </BlueLink>{" "}
        promotion {formatMillesime(millesime)}.{" "}
        <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
          D&apos;où viennent ces données ?
        </BlueLink>
      </Typography>
    </FlexCenterColumnBox>
  );
}

export default function WidgetInserJeunesNew({ formationDetail }: { formationDetail: FormationDetail }) {
  const {
    formationEtablissement: { indicateurPoursuiteAnneeCommune, indicateurPoursuite },
  } = formationDetail;
  const millesime = indicateurPoursuiteAnneeCommune?.length
    ? indicateurPoursuiteAnneeCommune[0].millesime
    : indicateurPoursuite
    ? indicateurPoursuite.millesime
    : "";

  return (
    <>
      {formationDetail.formation.isAnneeCommune ? (
        <>
          <StyledTitle variant="h3">
            Que sont devenus les anciens élèves 6 mois après ces différents BAC PRO ?
          </StyledTitle>
          <EtablissementLibelle etablissement={formationDetail.etablissement} />
          <ContainerAnneeCommune>
            <WidgetInserJeunesFamilleMetier
              etablissement={formationDetail.etablissement}
              indicateurPoursuiteAnneeCommune={formationDetail.formationEtablissement.indicateurPoursuiteAnneeCommune}
            />
            <WidgetFooter millesime={millesime} />
          </ContainerAnneeCommune>
        </>
      ) : (
        <>
          <StyledTitle variant="h3">Que sont devenus les anciens élèves 6 mois après cette formation ?</StyledTitle>
          <EtablissementLibelle etablissement={formationDetail.etablissement} />
          <ContainerFormation>
            <WidgetInserJeunesFormation
              indicateurPoursuite={formationDetail.formationEtablissement.indicateurPoursuite}
            />
            <WidgetFooter millesime={millesime} />
          </ContainerFormation>
        </>
      )}
      {createPortal(<DialogInserjeunesEmploi />, document.body)}
      {createPortal(<DialogInserjeunesFormation />, document.body)}
      {createPortal(<DialogInserjeunesAutres />, document.body)}
    </>
  );
}
