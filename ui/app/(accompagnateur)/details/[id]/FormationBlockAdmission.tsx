"use client";
import { Box } from "@mui/material";
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";
import { Typography } from "#/app/components/MaterialUINext";
import FormationDescription from "../../components/FormationDescription";
import { Formation } from "#/types/formation";
import Card from "#/app/components/Card";

export default function FormationBlockAdmission({
  formation,
  ...cardProps
}: {
  formation: Formation;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title={"L'admission"} {...cardProps}>
      <FormationDescription description={formation.descriptionAcces}></FormationDescription>
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
