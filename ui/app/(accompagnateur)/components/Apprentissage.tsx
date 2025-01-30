import React from "react";
import { TagApprentissage as StyledTagApprentissage } from "#/app/components/Tag";
import { Formation } from "shared";
import "moment/locale/fr";

export const LabelApprentissage = React.memo(function ({ formation }: { formation: Formation }) {
  return formation.voie === "apprentissage" && <StyledTagApprentissage>Alternance</StyledTagApprentissage>;
});
LabelApprentissage.displayName = "LabelApprentissage";
