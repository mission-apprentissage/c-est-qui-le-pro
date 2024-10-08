"use client";
import { Box, Grid } from "@mui/material";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import { Typography } from "#/app/components/MaterialUINext";
import FormationDescription from "../../components/FormationDescription";
import { FormationDetail } from "#/types/formation";
import Card from "#/app/components/Card";
import { THRESHOLD_TAUX_PRESSION } from "../../constants/constants";
import Tag from "#/app/components/Tag";
import Button from "#/app/components/Button";
import Link from "#/app/components/Link";
import Divider from "#/app/components/Divider";
import { fr } from "@codegouvfr/react-dsfr";

function FormationBlockAdmissionScolaire({
  formationDetail: { formationEtablissement },
}: {
  formationDetail: FormationDetail;
}) {
  let { premiersVoeux, capacite, effectifs, tauxPression } = formationEtablissement?.indicateurEntree ?? {};
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
  const max = Math.max(premiersVoeux || 0, capacite || 0, effectifs || 0);

  const baseStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100px",
    borderRadius: "100px",
  };

  if (!tauxPression || premiersVoeux === undefined || capacite === undefined || effectifs === undefined) {
    return null;
  }

  return (
    <Box style={{ marginTop: "2rem" }}>
      <Typography variant="h3" style={{ marginBottom: "1.5rem" }}>
        Est-ce facile d’y rentrer ?
      </Typography>
      <Box style={{ fontWeight: "500" }}>
        <>
          {admissionLevel === "easy" && (
            <Box>
              <Tag square level="easy" style={{ marginRight: "0.5rem" }}>
                Oui
              </Tag>
              C’est plutôt simple, il y avait plus de places disponibles que de demandes l’an dernier.
            </Box>
          )}
        </>
        <>
          {admissionLevel === "average" && (
            <Box>
              <Tag square level="average" style={{ marginRight: "0.5rem" }}>
                Moyennement
              </Tag>
              Il y a eu plus de demandes que de places disponibles l’an dernier.
            </Box>
          )}
        </>
        <>
          {admissionLevel === "hard" && (
            <Box>
              <Tag square level="hard" style={{ marginRight: "0.5rem" }}>
                Non
              </Tag>
              L’an dernier, il y a eu bien plus de demandes que de places disponibles.
            </Box>
          )}
        </>
      </Box>
      <Box sx={{ width: "300px", fontSize: "0.875rem", marginLeft: { sm: "0", md: "3rem" }, marginTop: "1.5rem" }}>
        <Grid container columnSpacing={3} rowSpacing={20}>
          <Grid item xs={4} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
            Vœux n°1
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
            Places
          </Grid>
          <Grid item xs={4} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
            Élèves à la rentrée
          </Grid>
          <Grid item xs={4} style={{ display: "flex", alignItems: "flex-end" }}>
            <Box
              style={{
                ...baseStyle,
                backgroundColor: "#BFCCFB",
                height: Math.max(minSize, (maxSize / max) * premiersVoeux),
                color: "#000091",
              }}
            >
              {premiersVoeux}
            </Box>
          </Grid>
          <Grid item xs={4} style={{ display: "flex", alignItems: "flex-end" }}>
            <Box
              style={{
                ...baseStyle,
                backgroundColor: "#E8EDFF",
                height: Math.max(minSize, (maxSize / max) * capacite),
                color: "#000091",
              }}
            >
              {capacite}
            </Box>
          </Grid>
          <Grid item xs={4} style={{ display: "flex", alignItems: "flex-end" }}>
            <Box
              style={{
                ...baseStyle,
                backgroundColor: "#000091",
                height: Math.max(minSize, (maxSize / max) * effectifs),
                color: "#FFFFFF",
              }}
            >
              {effectifs}
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Divider variant="middle" style={{ marginLeft: 0, marginRight: 0, marginTop: "2rem", marginBottom: "2rem" }} />
    </Box>
  );
}

function FormationBlockAdmissionVoeux({ formationDetail }: { formationDetail: FormationDetail }) {
  if (formationDetail.formation.voie === "apprentissage") {
    return (
      <Box style={{ marginTop: "2rem" }}>
        <Typography variant="h3" style={{ marginBottom: "1rem" }}>
          Est-ce facile d’y rentrer ?
        </Typography>
        <Box style={{ marginBottom: "1rem" }}>
          En alternance, le plus compliqué est bien souvent de trouver une entreprise pour signer un contrat.
          <br />
          <br /> Mais pas de panique ! Il y a beaucoup d&apos;interlocuteurs et de ressources pour aider dans cette
          recherche.
          <br />
          <ul>
            <li>
              Il est par exemple possible de <b>se faire aider par son futur lycée ou CFA</b> (centre de formation
              d&apos;apprentis) ou par une mission locale.
            </li>
            <li>
              Le site <b>La bonne alternance</b> permet de consulter des offres de contrat en alternance des entreprises
              qui recrutent.
            </li>
          </ul>
        </Box>
        <Link
          style={{ backgroundImage: "none" }}
          noIcon
          href="https://labonnealternance.apprentissage.beta.gouv.fr/"
          target="_blank"
        >
          <Button priority="secondary">Trouver mon entreprise sur La Bonne Alternance</Button>
        </Link>
        <Divider variant="middle" style={{ marginLeft: 0, marginRight: 0, marginTop: "2rem", marginBottom: "2rem" }} />
      </Box>
    );
  }

  return <FormationBlockAdmissionScolaire formationDetail={formationDetail} />;
}

export default function FormationBlockAdmission({
  formationDetail,
  ...cardProps
}: {
  formationDetail: FormationDetail;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title={"L'admission"} {...cardProps}>
      <FormationDescription description={formationDetail.formation.descriptionAcces}></FormationDescription>
      <FormationBlockAdmissionVoeux formationDetail={formationDetail} />
      <Box style={{ marginTop: "2rem" }}>
        <Typography variant="h3" style={{ marginBottom: "1rem" }}>
          Ai-je le droit à une aide ?
        </Typography>
        <ul style={{ listStyleType: "none", paddingLeft: 0, margin: 0 }}>
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
        </ul>
        <Highlight style={{ marginLeft: 0, marginTop: "2rem" }}>
          Des questions sur les demandes de bourse de collège ?<br />
          <b>Une plateforme d&#39;assistance nationale est mise à votre disposition.</b>
          <br />
          <b>Par téléphone : 0 809 54 06 06 (prix d&#39;un appel local)</b>
          <br />
          <b>Du lundi au vendredi de 8h à 20h</b>
        </Highlight>
      </Box>
    </Card>
  );
}
