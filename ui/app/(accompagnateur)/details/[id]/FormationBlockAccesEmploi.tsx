import Card from "#/app/components/Card";
import { Typography } from "#/app/components/MaterialUINext";
import { Etablissement, Formation } from "#/types/formation";
import WidgetInserJeunes from "../../components/WidgetInserJeunes";

export default function FormationBlockAccesEmploi({
  formation,
  etablissement,
  ...cardProps
}: {
  formation: Formation;
  etablissement: Etablissement;
} & React.ComponentProps<typeof Card>) {
  return (
    <Card type="details" title="L’accès à l’emploi" {...cardProps}>
      <Typography variant="h3">Que deviennent les élèves après ce CAP ?</Typography>
      <WidgetInserJeunes etablissement={etablissement} formation={formation} />
    </Card>
  );
}
