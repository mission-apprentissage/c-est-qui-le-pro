/** @jsxImportSource @emotion/react */
"use client";
import { css } from "@emotion/react";
import { Box, Grid } from "@mui/material";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import { Typography } from "#/app/components/MaterialUINext";
import FormationDescription from "../../components/FormationDescription";
import { FormationDetail, IndicateurEntree, THRESHOLD_TAUX_PRESSION } from "shared";
import Card from "#/app/components/Card";
import Tag from "#/app/components/Tag";
import Button from "#/app/components/Button";
import Link from "#/app/components/Link";
import { fr } from "@codegouvfr/react-dsfr";
import FormationsFamilleMetier from "../../components/FormationFamilleMetier";
import { LIBELLE_PRESSION } from "#/app/services/formation";

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
    <Box>
      <Tag square level={level} style={{ marginRight: "0.5rem" }}>
        {tagByLevel[level].title}
      </Tag>
      <div style={{ marginTop: "0.5rem" }}>{tagByLevel[level].description}</div>
    </Box>
  );
}

function FormationBlockAdmissionScolaire({ indicateurEntree }: { indicateurEntree: IndicateurEntree }) {
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

  const baseStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100px",
    borderRadius: "100px",
  };

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
        <Box style={{ fontWeight: "500" }}>
          <TagAdmission level={admissionLevel} rentreeScolaire={rentreeScolaire} />
        </Box>
        <Box sx={{ width: "340px", fontSize: "0.875rem", marginLeft: { sm: "0", md: "3rem" }, marginTop: "1.5rem" }}>
          <Grid container columnSpacing={3} rowSpacing={20}>
            <Grid item xs={3} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
              Total vœux
            </Grid>
            <Grid item xs={3} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
              Vœux n°1
            </Grid>
            <Grid item xs={3} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
              Places
            </Grid>
            <Grid item xs={3} style={{ textAlign: "center", color: fr.colors.decisions.text.title.blueFrance.default }}>
              Élèves à la rentrée
            </Grid>
            <Grid item xs={3} style={{ display: "flex", alignItems: "flex-end" }}>
              <Box
                style={{
                  ...baseStyle,
                  backgroundColor: "#E8EDFF",
                  color: "#000091",
                  height: Math.max(minSize, maxSize * (Math.log(1 + voeux) / Math.log(1 + max))),
                }}
              >
                {voeux}
              </Box>
            </Grid>
            <Grid item xs={3} style={{ display: "flex", alignItems: "flex-end" }}>
              <Box
                style={{
                  ...baseStyle,
                  backgroundColor: "#BFCCFB",
                  color: "#000091",
                  height: Math.max(minSize, maxSize * (Math.log(1 + premiersVoeux) / Math.log(1 + max))),
                }}
              >
                {premiersVoeux}
              </Box>
            </Grid>
            <Grid item xs={3} style={{ display: "flex", alignItems: "flex-end" }}>
              <Box
                style={{
                  ...baseStyle,
                  backgroundColor: "#000091",
                  color: "#FFFFFF",
                  height: Math.max(minSize, maxSize * (Math.log(1 + capacite) / Math.log(1 + max))),
                }}
              >
                {capacite}
              </Box>
            </Grid>
            <Grid item xs={3} style={{ display: "flex", alignItems: "flex-end" }}>
              <Box
                style={{
                  ...baseStyle,
                  backgroundColor: "#E3E3FD",
                  color: "#000091",
                  height: Math.max(minSize, maxSize * (Math.log(1 + effectifs) / Math.log(1 + max))),
                }}
              >
                {effectifs}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <div className={fr.cx("fr-highlight")} style={{ marginLeft: 0 }}>
        <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Attention l’admission dépend aussi : </div>
        <ul
          css={css`
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
          `}
        >
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
        </ul>
        <div>
          Conseil aux candidats : de façon à augmenter les chances d’être retenu, il est conseillé de formuler plusieurs
          vœux, dans différents établissements et pour plusieurs formations.
        </div>
      </div>
    </>
  );
}

function FormationBlockAdmissionVoeux({ formationDetail }: { formationDetail: FormationDetail }) {
  if (formationDetail.formation.voie === "apprentissage") {
    return (
      <Box>
        <Typography variant="h3">Est-ce facile d’y rentrer ?</Typography>
        <Box style={{ marginBottom: "1rem" }}>
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
      </Box>
    );
  }

  return (
    formationDetail.formationEtablissement.indicateurEntree && (
      <FormationBlockAdmissionScolaire indicateurEntree={formationDetail.formationEtablissement.indicateurEntree} />
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
      <Box style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        <FormationsFamilleMetier
          withLink
          anneeCommune
          formationDetail={formationDetail}
          sx={{
            padding: "1rem 0.75rem",
            borderRadius: "9px",
          }}
        />

        <FormationDescription description={formationDetail.formation.descriptionAcces}></FormationDescription>
        <FormationBlockAdmissionVoeux formationDetail={formationDetail} />
        <Box>
          <Typography variant="h3">Ai-je le droit à une aide ?</Typography>
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
          <Box className={fr.cx("fr-highlight")} style={{ marginLeft: 0, marginTop: "2rem" }}>
            Des questions sur les demandes de bourse de collège ?<br />
            <b>Une plateforme d&#39;assistance nationale est mise à votre disposition.</b>
            <br />
            <b>Par téléphone : 0 809 54 06 06 (prix d&#39;un appel local)</b>
            <br />
            <b>Du lundi au vendredi de 8h à 20h</b>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
