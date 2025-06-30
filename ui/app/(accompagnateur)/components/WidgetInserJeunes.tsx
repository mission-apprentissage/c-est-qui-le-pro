/** @jsxImportSource @emotion/react */
"use client";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { Theme, useMediaQuery } from "@mui/material";
import { ReactNode, useMemo } from "react";
import {
  Etablissement,
  FormationDetail,
  IndicateurPoursuite,
  IndicateurPoursuiteRegional,
  IndicateurPoursuiteAnneeCommune,
  FormationFamilleMetierDetail,
  EtablissementTypeLibelle,
  EtablissementTypeFromValue,
} from "shared";
import UnionIcon from "#/app/components/icon/UnionIcon";
import { fr, FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
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
import { capitalize, isNil } from "lodash-es";
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
  StyledFormationLibelle,
  StyledTitle,
} from "./WidgetInserJeunes.styled";

function isSousSeuil(indicateurPoursuite: IndicateurPoursuite) {
  return isNil(indicateurPoursuite?.taux_en_formation);
}

function formatLibelleTabEtablissement(etablissement: Etablissement) {
  const prefix = {
    INCONNU: "cet",
    GRETA: "ce",
    AIDE: "ce",
    EREA: "ce",
    LYC: "ce",
    EXP: "cet",
    CNED: "ce",
    SGT: "cette",
    SOC: "cette",
    PBAC: "cette",
    HOSP: "cette",
    SEP: "cette",
    CONT: "cet",
    CFPA: "cette",
    LP: "ce",
    CFA: "ce",
    TSGE: "cet",
    CLG: "ce",
    EME: "cet",
  };

  return `Pour ${prefix[EtablissementTypeFromValue[etablissement.type]]} ${
    EtablissementTypeLibelle[EtablissementTypeFromValue[etablissement.type] || "INCONNU"]
  }`;
}

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

          if (metrics[keyTyped] === 0) {
            return null;
          }

          return (
            <Box key={`indicateur_${key}`}>
              <PersonasContainer>
                {Array.from({ length: metrics[keyTyped] }, (_, i) => (
                  <Persona key={`${key}_${i}`} type={keyTyped} />
                ))}
              </PersonasContainer>
              {isDownSm && !!indicateurPoursuite[metric.metric] && (
                <Description color={metric.color} vertical={isDownSm} onClick={modals[keyTyped].open}>
                  <Box>{indicateurPoursuite[metric.metric]}%</Box>
                  <Box>
                    {metric.description}&nbsp;<i className={fr.cx("ri-information-line")}></i>
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

            if (!indicateurPoursuite[metric.metric]) {
              return null;
            }

            return (
              <Description key={`indicateur_desription_${key}`} color={metric.color} onClick={modals[keyTyped].open}>
                <Box>{indicateurPoursuite[metric.metric]}%</Box>
                <Box>
                  <Box>
                    <i className={fr.cx(metric.icon)}></i>
                    <Box>
                      {metric.description}&nbsp;<i className={fr.cx("ri-information-line")}></i>
                    </Box>
                  </Box>
                </Box>
              </Description>
            );
          })}
        </DescriptionContainer>
      )}
    </IndicateursContainer>
  );
}

export function WidgetInserJeunesFormation({ indicateurPoursuite }: { indicateurPoursuite?: IndicateurPoursuite }) {
  return (
    <Box>
      {!indicateurPoursuite ? (
        <NoIndicateurs />
      ) : isSousSeuil(indicateurPoursuite) ? (
        <IndicateursSousSeuil />
      ) : (
        <IndicateursWithPersona indicateurPoursuite={indicateurPoursuite} />
      )}
    </Box>
  );
}

function WidgetInserJeunesTab({
  etablissement,
  indicateurPoursuite,
  indicateurPoursuiteRegional,
}: {
  etablissement: Etablissement;
  indicateurPoursuite?: IndicateurPoursuite;
  indicateurPoursuiteRegional?: IndicateurPoursuiteRegional;
}) {
  const tabs = useMemo(() => {
    let tabs: {
      isDefault?: boolean;
      label: ReactNode;
      iconId?: FrIconClassName | RiIconClassName;
      content: ReactNode;
    }[] = [];
    if (indicateurPoursuite && !isSousSeuil(indicateurPoursuite)) {
      tabs.push({
        label: formatLibelleTabEtablissement(etablissement),
        iconId: "ri-arrow-right-line",
        isDefault: true,
        content: (
          <>
            <WidgetInserJeunesFormation indicateurPoursuite={indicateurPoursuite} />
          </>
        ),
      });
    }

    if (indicateurPoursuiteRegional?.byDiplome && !isSousSeuil(indicateurPoursuiteRegional?.byDiplome)) {
      tabs.push({
        label: "Sur la région",
        iconId: "ri-map-pin-2-line",
        content: (
          <>
            <WidgetInserJeunesFormation indicateurPoursuite={indicateurPoursuiteRegional?.byDiplome} />
          </>
        ),
      });
    }

    return tabs;
  }, [indicateurPoursuite, indicateurPoursuiteRegional]);

  if (tabs.length === 0) {
    return <NoIndicateurs />;
  }

  return <Tabs tabs={tabs}></Tabs>;
}

function formatIndicateurPoursuiteAnneeCommune(
  indicateurPoursuiteAnneeCommune?: IndicateurPoursuiteAnneeCommune[],
  formationFamilleMetier?: FormationFamilleMetierDetail[]
) {
  const indicateurPoursuite: {
    libelle?: string;
    codeCertification?: string;
    indicateurPoursuite?: IndicateurPoursuite;
    indicateurPoursuiteRegional?: IndicateurPoursuiteRegional;
  }[] = (indicateurPoursuiteAnneeCommune || []).map((indicateurPoursuite, index) => {
    const regional = formationFamilleMetier?.find((f) => f.formation.mef11 === indicateurPoursuite.codeCertification);
    return {
      libelle: indicateurPoursuite.libelle,
      codeCertification: indicateurPoursuite.codeCertification,
      indicateurPoursuite,
      indicateurPoursuiteRegional: regional?.formationEtablissement?.indicateurPoursuiteRegional,
    };
  });

  for (const formationDetail of formationFamilleMetier || []) {
    // Il peut y avoir des données au niveau régional qui n'existent pas dans indicateurPoursuiteAnneeCommune qui est construit à partir du niveau établissement des données IJs
    if (
      formationDetail.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome &&
      !indicateurPoursuite.find((f) => f.codeCertification === formationDetail.formation.mef11)
    ) {
      indicateurPoursuite.push({
        libelle: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional?.byDiplome?.libelle,
        codeCertification: formationDetail.formation.mef11,
        indicateurPoursuiteRegional: formationDetail?.formationEtablissement?.indicateurPoursuiteRegional,
      });
    }
  }

  return indicateurPoursuite;
}

function WidgetInserJeunesFamilleMetier({
  etablissement,
  indicateurPoursuiteAnneeCommune,
  formationFamilleMetier,
}: {
  etablissement: Etablissement;
  indicateurPoursuiteAnneeCommune?: IndicateurPoursuiteAnneeCommune[];
  formationFamilleMetier?: FormationFamilleMetierDetail[];
}) {
  const hasStats = !!indicateurPoursuiteAnneeCommune?.length;
  const indicateursPoursuite = useMemo(
    () => formatIndicateurPoursuiteAnneeCommune(indicateurPoursuiteAnneeCommune, formationFamilleMetier),
    [indicateurPoursuiteAnneeCommune, formationFamilleMetier]
  );

  return (
    <Box>
      {!hasStats && <NoIndicateurs />}
      {hasStats && (
        <Box>
          {indicateursPoursuite.map((indicateurPoursuite, index) => {
            const hasData =
              indicateurPoursuite.indicateurPoursuite?.taux_en_formation !== undefined ||
              indicateurPoursuite.indicateurPoursuiteRegional?.byDiplome?.taux_en_formation !== undefined;
            return (
              <Box key={`poursuite_anneee_commune_${index}`}>
                <CustomAccordion
                  defaultExpanded={hasData}
                  label={
                    <StyledFormationLibelle variant="subtitle1" active={hasData}>
                      {index + 1}. Après {capitalize(indicateurPoursuite.libelle)}
                    </StyledFormationLibelle>
                  }
                >
                  <AccordionContainer>
                    <WidgetInserJeunesTab
                      etablissement={etablissement}
                      indicateurPoursuite={indicateurPoursuite.indicateurPoursuite}
                      indicateurPoursuiteRegional={indicateurPoursuite.indicateurPoursuiteRegional}
                    />
                  </AccordionContainer>
                </CustomAccordion>

                <StyledDivider active={hasData} />
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export function WidgetFooter({ millesime }: { millesime: string }) {
  const millesimePart = millesime.split("_");

  if (!millesime) {
    return null;
  }

  return (
    <FlexCenterColumnBox>
      <Typography variant="body3">
        Données issues du dispositif{" "}
        <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
          InserJeunes
        </BlueLink>{" "}
        promotion{millesimePart.length > 1 ? "s" : ""} {formatMillesime(millesime)}.{" "}
        <BlueLink target="_blank" href="https://documentation.exposition.inserjeunes.beta.gouv.fr/">
          D&apos;où viennent ces données ?
        </BlueLink>
      </Typography>
    </FlexCenterColumnBox>
  );
}

export default function WidgetInserJeunes({ formationDetail }: { formationDetail: FormationDetail }) {
  const isAnneeCommune = formationDetail.formation.isAnneeCommune ?? false;
  const {
    formationEtablissement: { indicateurPoursuiteAnneeCommune, indicateurPoursuite, indicateurPoursuiteRegional },
    etablissement,
  } = formationDetail;
  const millesime = indicateurPoursuiteAnneeCommune?.length
    ? indicateurPoursuiteAnneeCommune[0].millesime
    : indicateurPoursuite
    ? indicateurPoursuite.millesime
    : indicateurPoursuiteRegional?.byDiplome
    ? indicateurPoursuiteRegional.byDiplome?.millesime
    : "";

  return (
    <>
      {isAnneeCommune ? (
        <>
          <StyledTitle variant="h3">
            Que sont devenus les anciens élèves 6 mois après ces différents BAC PRO ?
          </StyledTitle>
          <ContainerAnneeCommune>
            <WidgetInserJeunesFamilleMetier
              etablissement={etablissement}
              formationFamilleMetier={formationDetail.formationsFamilleMetier}
              indicateurPoursuiteAnneeCommune={indicateurPoursuiteAnneeCommune}
            />
            <WidgetFooter millesime={millesime} />
          </ContainerAnneeCommune>
        </>
      ) : (
        <>
          <StyledTitle variant="h3">Que sont devenus les anciens élèves 6 mois après cette formation ?</StyledTitle>
          <ContainerFormation>
            <WidgetInserJeunesTab
              etablissement={etablissement}
              indicateurPoursuite={indicateurPoursuite}
              indicateurPoursuiteRegional={indicateurPoursuiteRegional}
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
