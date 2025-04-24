"use client";
import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { FormationTag } from "shared";
import Tag from "#/app/components/Tag";
import { FORMATION_TAG } from "#/app/services/formation";
import { fr } from "@codegouvfr/react-dsfr";

export default function FormationTags({ tags, withIcon = false }: { tags: FormationTag[]; withIcon?: boolean }) {
  return tags.map((tag) => {
    const tagData = FORMATION_TAG.find((t) => t.tag === tag);

    if (!tagData) {
      return null;
    }

    return (
      <Tag key={"tag_" + tagData.tag} style={{ color: tagData.color, backgroundColor: tagData.bgColor }}>
        <Typography component="span" color={tagData.color} variant="body2" style={{ fontWeight: 500 }}>
          {withIcon && <i className={fr.cx(tagData.icon, "fr-icon--sm")} style={{ marginRight: "0.25rem" }}></i>}
          {tagData.tagLibelle}
        </Typography>
      </Tag>
    );
  });
}
