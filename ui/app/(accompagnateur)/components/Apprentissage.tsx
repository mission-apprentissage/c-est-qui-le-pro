import React from "react";
import { Typography } from "@mui/material";
import Tag from "#/app/components/Tag";
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
  return (
    formation.voie === "apprentissage" && (
      <Typography
        style={{
          fontSize: "16px",
          color: "var(--warning-425-625-hover)",
        }}
      >
        Alternance
      </Typography>
    )
  );
}
