/** @jsxImportSource @emotion/react */
"use client";
import { Box, Grid, useTheme } from "@mui/material";
import { Typography } from "#/app/components/MaterialUINext";
import { IndicateurEntree, THRESHOLD_TAUX_PRESSION } from "shared";
import Tag from "#/app/components/Tag";
import { fr } from "@codegouvfr/react-dsfr";
import { LIBELLE_PRESSION } from "#/app/services/formation";
import styled from "@emotion/styled";
import { HighlightBox } from "./FormationBlock.styled";

const FlexGrid = styled(Grid)`
  display: flex;
  align-items: flex-end;
`;

const HighlightTitle = styled.div`
  font-weight: 700;
  margin-bottom: 1rem;
`;

const HighlightList = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  & li {
    padding: 0;
  }
  & li i {
    color: #000091;
  }
`;

const Capsule = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100px;
  border-radius: 100px;
  color: #000091;
`;

const CapsuleVoeux = styled(Capsule)`
  background-color: #e8edff;
`;

const CapsulePremiersVoeux = styled(Capsule)`
  background-color: #bfccfb;
`;

const CapsuleCapacite = styled(Capsule)`
  background-color: #000091;
  color: #ffffff;
`;

const CapsuleEffectifs = styled(Capsule)`
  background-color: #e3e3fd;
`;

const AdmissionBox = styled(Box)`
  width: 340px;
  font-size: 0.875rem;

  ${({ theme }) => ` ${theme.breakpoints.up("sm")} {
    margin-left: 0;
  }
    ${theme.breakpoints.up("md")} {
    margin-left: 3rem;
  }`}

  margin-top: 1.5rem;
  text-align: center;
  color: ${fr.colors.decisions.text.title.blueFrance.default};
`;

const TagAdmissionContainer = styled(Box)`
  font-weight: 500;
  gap: 0.5rem;
  display: flex;
  flex-direction: column;
`;

function TagAdmission({
  level,
  rentreeScolaire,
}: {
  level: "easy" | "average" | "hard" | "unknow";
  rentreeScolaire: string;
}) {
  const tagByLevel = {
    easy: {
      title: <>{LIBELLE_PRESSION["easy"]}</>,
      description: (
        <>
          L’an dernier (Mai {rentreeScolaire}), c’était plutôt favorable. La formation n’a pas été très demandée : il y
          avait plus de places dans les classes que de vœux n°1 formulés par les élèves. Mais attention certains élèves
          n’ont pas été pris dans cette formation en raison de leur dossier.
        </>
      ),
    },
    average: {
      title: <>{LIBELLE_PRESSION["average"]}</>,
      description: (
        <>
          L’an dernier (Mai {rentreeScolaire}), c’était assez difficile. La formation a été souvent demandée : il y
          avait moins de places disponibles dans les classes que de vœux n°1 formulés par les élèves. Certains élèves
          n’ont donc pas été pris dans cette formation.
        </>
      ),
    },
    hard: {
      title: <>{LIBELLE_PRESSION["hard"]}</>,
      description: (
        <>
          L’an dernier (Mai {rentreeScolaire}), c’était très difficile. La formation a été demandée par de nombreux
          élèves. Il n’y avait donc pas assez de places dans les classes pour accueillir tous ceux ayant formulé ce vœu.
          De nombreux élèves n’ont donc pas été pris dans cette formation.
        </>
      ),
    },
    unknow: {
      title: <></>,
      description: <></>,
    },
  };

  return level === "unknow" ? (
    <></>
  ) : (
    <TagAdmissionContainer>
      <Tag square level={level}>
        {tagByLevel[level].title}
      </Tag>
      <div>{tagByLevel[level].description}</div>
    </TagAdmissionContainer>
  );
}

export function FormationBlockAdmissionScolaire({ indicateurEntree }: { indicateurEntree: IndicateurEntree }) {
  const theme = useTheme();
  let { premiersVoeux, voeux, capacite, effectifs, tauxPression, rentreeScolaire } = indicateurEntree;
  const admissionLevel =
    tauxPression === undefined
      ? "unknow"
      : tauxPression <= THRESHOLD_TAUX_PRESSION[0]
      ? "easy"
      : tauxPression < THRESHOLD_TAUX_PRESSION[1]
      ? "average"
      : "hard";
  const maxSize = 158;
  const minSize = 84;
  const max = Math.max(voeux || 0, premiersVoeux || 0, capacite || 0, effectifs || 0);

  if (
    !tauxPression ||
    voeux === undefined ||
    premiersVoeux === undefined ||
    capacite === undefined ||
    effectifs === undefined
  ) {
    return null;
  }

  return (
    <>
      <Box>
        <Typography variant="h3">Est-ce facile d’y rentrer ?</Typography>

        <TagAdmission level={admissionLevel} rentreeScolaire={rentreeScolaire} />

        <AdmissionBox theme={theme}>
          <Grid container columnSpacing={3} rowSpacing={20}>
            <Grid item xs={3}>
              Total vœux
            </Grid>
            <Grid item xs={3}>
              Vœux n°1
            </Grid>
            <Grid item xs={3}>
              Places
            </Grid>
            <Grid item xs={3}>
              Élèves à la rentrée
            </Grid>
            <FlexGrid item xs={3}>
              <CapsuleVoeux
                style={{
                  height: Math.max(minSize, maxSize * (Math.log(1 + voeux) / Math.log(1 + max))),
                }}
              >
                {voeux}
              </CapsuleVoeux>
            </FlexGrid>
            <FlexGrid item xs={3}>
              <CapsulePremiersVoeux
                style={{
                  height: Math.max(minSize, maxSize * (Math.log(1 + premiersVoeux) / Math.log(1 + max))),
                }}
              >
                {premiersVoeux}
              </CapsulePremiersVoeux>
            </FlexGrid>
            <FlexGrid item xs={3}>
              <CapsuleCapacite
                style={{
                  height: Math.max(minSize, maxSize * (Math.log(1 + capacite) / Math.log(1 + max))),
                }}
              >
                {capacite}
              </CapsuleCapacite>
            </FlexGrid>
            <FlexGrid item xs={3}>
              <CapsuleEffectifs
                style={{
                  height: Math.max(minSize, maxSize * (Math.log(1 + effectifs) / Math.log(1 + max))),
                }}
              >
                {effectifs}
              </CapsuleEffectifs>
            </FlexGrid>
          </Grid>
        </AdmissionBox>
      </Box>
      <HighlightBox>
        <HighlightTitle>Attention l’admission dépend aussi : </HighlightTitle>
        <HighlightList>
          <li>
            <i className={fr.cx("ri-home-4-line")} /> de l’adresse du domicile, et notamment de l’académie de
            rattachement
          </li>
          <li>
            <i className={fr.cx("ri-checkbox-multiple-line")} /> de la maîtrise des compétences du socle commun et des
            résultats scolaires
          </li>
          <li>
            <i className={fr.cx("ri-chat-follow-up-line")} /> de l’avis des chefs d’établissement d’origine et d’accueil
          </li>
          <li>
            <i className={fr.cx("ri-mental-health-line")} /> de la motivation
          </li>
        </HighlightList>
        <div>
          Conseil aux candidats : de façon à augmenter les chances d’être retenu, il est conseillé de formuler plusieurs
          vœux, dans différents établissements et pour plusieurs formations.
        </div>
      </HighlightBox>
    </>
  );
}
