"use client";
import { Box } from "@mui/material";
import FormationDescription from "../../components/FormationDescription";
import { Etablissement, Formation } from "#/types/formation";
import Card from "#/app/components/Card";
import Link from "#/app/components/Link";
import WidgetSiriusFormation from "../../components/WidgetSiriusFormation";

export default function FormationBlockFormation({
  formation,
  etablissement,
  ...cardProps
}: {
  formation: Formation;
  etablissement: Etablissement;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title={"La formation"} {...cardProps}>
      <FormationDescription description={formation.description}>
        {formation.description && (
          <Box style={{ marginTop: "2rem" }}>
            <Link
              style={{ color: "var(--blue-france-sun-113-625)" }}
              target="_blank"
              href={`https://www.onisep.fr/http/redirection/formation/slug/${formation?.onisepIdentifiant}`}
            >
              En savoir plus, sur le site de l&apos;Onisep
            </Link>
          </Box>
        )}
      </FormationDescription>
      {formation.voie === "apprentissage" && (
        <Box>
          <WidgetSiriusFormation formation={formation} fallbackComponent={<></>} />
        </Box>
      )}
    </Card>
  );
}
