"use client";
import { Box } from "@mui/material";
import FormationDescription from "../../components/FormationDescription";
import { FormationDetail } from "shared";
import Card from "#/app/components/Card";
import Link from "#/app/components/Link";
import WidgetSiriusFormation from "../../components/WidgetSiriusFormation";
import FormationsFamilleMetier from "../../components/FormationFamilleMetier";

export default function FormationBlockFormation({
  formationDetail,
  ...cardProps
}: {
  formationDetail: FormationDetail;
} & React.ComponentProps<typeof Card>) {
  const { formation } = formationDetail;

  return (
    <Card type="details" title={"La formation"} {...cardProps}>
      <Box style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
        <FormationsFamilleMetier
          withLink
          formationDetail={formationDetail}
          sx={{
            padding: "1rem 0.75rem",
            borderRadius: "9px",
          }}
        />

        <FormationDescription description={formation.description}>
          {formation.description && (
            <Box>
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
      </Box>
    </Card>
  );
}
