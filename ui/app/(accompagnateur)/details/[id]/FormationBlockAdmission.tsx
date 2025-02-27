/** @jsxImportSource @emotion/react */
"use client";
import styled from "@emotion/styled";
import { Box } from "@mui/material";
import { Typography } from "#/app/components/MaterialUINext";
import FormationDescription from "../../components/FormationDescription";
import { FormationDetail } from "shared";
import Card from "#/app/components/Card";
import Button from "#/app/components/Button";
import Link from "#/app/components/Link";
import FormationsFamilleMetier from "../../components/FormationFamilleMetier";
import { BlockDivider, ContentContainer, HighlightBox } from "./FormationBlock.styled";
import { FormationBlockAdmissionScolaire } from "./FormationBlockAdmissionScolaire";

const ListAide = styled.ul`
  list-style-type: none;
  padding-left: 0;
  margin: 0;
`;

const BoxAdmissionAlternance = styled(Box)`
  margin-bottom: 1rem;
`;

function FormationBlockAdmissionVoeux({ formationDetail }: { formationDetail: FormationDetail }) {
  if (formationDetail.formation.voie === "apprentissage") {
    return (
      <>
        <Box>
          <Typography variant="h3">Est-ce facile d’y rentrer ?</Typography>
          <BoxAdmissionAlternance>
            En alternance, le plus compliqué est bien souvent de trouver une entreprise pour signer un contrat.
            <br />
            <br /> Mais pas de panique ! Il y a beaucoup d’interlocuteurs et de ressources pour aider dans cette
            recherche.
            <br />
            <ul>
              <li>
                Il est par exemple possible de <b>se faire aider par son futur lycée ou CFA</b> (centre de formation
                d’apprentis) ou par une mission locale.
              </li>
              <li>
                Le site <b>La bonne alternance</b> permet de consulter des offres de contrat en alternance des
                entreprises qui recrutent.
              </li>
            </ul>
          </BoxAdmissionAlternance>
          <Link noDecoration noIcon href="https://labonnealternance.apprentissage.beta.gouv.fr/" target="_blank">
            <Button priority="secondary">Trouver mon entreprise sur La Bonne Alternance</Button>
          </Link>
        </Box>
        <BlockDivider />
      </>
    );
  }

  return (
    formationDetail.formationEtablissement.indicateurEntree && (
      <>
        <FormationBlockAdmissionScolaire indicateurEntree={formationDetail.formationEtablissement.indicateurEntree} />
        <BlockDivider />
      </>
    )
  );
}

export default function FormationBlockAdmission({
  formationDetail,
  ...cardProps
}: {
  formationDetail: FormationDetail;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title={"L'admission"} {...cardProps}>
      <ContentContainer>
        <FormationsFamilleMetier withLink anneeCommune formationDetail={formationDetail} />

        <FormationDescription description={formationDetail.formation.descriptionAcces}></FormationDescription>
        <FormationBlockAdmissionVoeux formationDetail={formationDetail} />
        <Box>
          <Typography variant="h3">Ai-je le droit à une aide ?</Typography>
          <ListAide>
            <li>
              ① Rapprochez-vous de <b>l’assistant.e social.e du collège</b>
            </li>
            <li>
              ② Consultez les{" "}
              <b>
                {" "}
                <a target="_blank" href="https://www.education.gouv.fr/les-bourses-de-college-et-de-lycee-326728">
                  bourses de lycées
                </a>
              </b>
            </li>
            <li>
              ③ Consultez les{" "}
              <b>
                <a target="_blank" href="https://www.education.gouv.fr/les-aides-financieres-au-lycee-7511">
                  allocations de rentrée scolaire
                </a>
              </b>
            </li>
          </ListAide>
        </Box>
        <HighlightBox>
          Des questions sur les demandes de bourse de collège ?<br />
          <b>Une plateforme d&#39;assistance nationale est mise à votre disposition.</b>
          <br />
          <b>Par téléphone : 0 809 54 06 06 (prix d&#39;un appel local)</b>
          <br />
          <b>Du lundi au vendredi de 8h à 20h</b>
        </HighlightBox>
        <BlockDivider />
      </ContentContainer>
    </Card>
  );
}
