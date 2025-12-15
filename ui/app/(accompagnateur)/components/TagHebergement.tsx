import React from "react";
import "moment/locale/fr";
import { TagHebergement as TagHebergementStyled } from "#/app/components/Tag";
import { Box } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";

export default function TagHebergement() {
  return (
    <Box>
      <TagHebergementStyled>
        <i className={fr.cx("ri-hotel-bed-line", "fr-icon--sm")} />
        Internat
      </TagHebergementStyled>
    </Box>
  );
}
