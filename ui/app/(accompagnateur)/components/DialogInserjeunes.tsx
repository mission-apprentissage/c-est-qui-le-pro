/** @jsxImportSource @emotion/react */
"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { createModal } from "#/app/components/Modal";
import { Box, styled } from "@mui/material";
import { Persona } from "./WidgetInserJeunes";
import { BlueLink } from "./InserJeunes.styled";
import { WIDGET_INSERJEUNES_TYPE, WidgetInserjeunesTypeMetrics } from "#/app/services/inserjeunes";

const StyledTitle = styled("span")<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 1.25rem;
  font-weight: 700;

  & i::before {
    --icon-size: 2rem;
    margin-right: 0.5rem;
  }
`;

const ContainerText = styled(Box)`
  margin-top: 2rem;
  margin-bottom: 2rem;
`;

export const modalInserjeunesEmploi = createModal({
  id: "dialog-inserjeunes-emploi-modal",
  isOpenedByDefault: false,
});
export const modalInserjeunesFormation = createModal({
  id: "dialog-inserjeunes-formation-modal",
  isOpenedByDefault: false,
});
export const modalInserjeunesAutres = createModal({
  id: "dialog-inserjeunes-autres-modal",
  isOpenedByDefault: false,
});

function DialogInserjeunes({
  metricKey,
  modal,
}: {
  metricKey: WidgetInserjeunesTypeMetrics;
  modal: ReturnType<typeof createModal>;
}) {
  const metric = WIDGET_INSERJEUNES_TYPE[metricKey];

  return (
    <>
      <modal.Component
        topAnchor={false}
        title={
          <StyledTitle color={metric.colorIcon}>
            <i className={fr.cx(metric.icon)}></i>
            {metric.modalTitle}
          </StyledTitle>
        }
        buttons={[
          {
            doClosesModal: false,
            children: "Ok",
            onClick: async () => {
              modal.close();
            },
          },
        ]}
      >
        <Box>
          <Persona type={metricKey} />
          <ContainerText>{metric.modalText}</ContainerText>

          <BlueLink
            onClick={() => {
              window.open("https://documentation.exposition.inserjeunes.beta.gouv.fr/");
            }}
            noDecoration
            target="_blank"
            href="https://documentation.exposition.inserjeunes.beta.gouv.fr/"
          >
            En savoir plus
          </BlueLink>
        </Box>
      </modal.Component>
    </>
  );
}

export function DialogInserjeunesEmploi() {
  return <DialogInserjeunes metricKey="emploi" modal={modalInserjeunesEmploi} />;
}

export function DialogInserjeunesFormation() {
  return <DialogInserjeunes metricKey="formation" modal={modalInserjeunesFormation} />;
}

export function DialogInserjeunesAutres() {
  return <DialogInserjeunes metricKey="autres" modal={modalInserjeunesAutres} />;
}
