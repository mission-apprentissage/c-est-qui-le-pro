import React from "react";
import Tag, { TagApprentissage as StyledTagApprentissage } from "#/app/components/Tag";
import { Formation } from "shared";
import "moment/locale/fr";

export function TagApprentissage({ formation }: { formation: Formation }) {
  return (
    formation.voie === "apprentissage" && (
      <Tag
        variant="yellow"
        square
        style={{
          fontWeight: 700,
        }}
      >
        EN ALTERNANCE
      </Tag>
    )
  );
}

export function LabelApprentissage({ formation }: { formation: Formation }) {
  return formation.voie === "apprentissage" && <StyledTagApprentissage>Alternance</StyledTagApprentissage>;
}
