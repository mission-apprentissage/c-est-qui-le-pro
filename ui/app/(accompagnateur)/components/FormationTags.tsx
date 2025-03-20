"use client";
import React from "react";
import { Typography } from "#/app/components/MaterialUINext";
import { FormationTag } from "shared";
import Tag from "#/app/components/Tag";
import { FORMATION_TAG } from "#/app/services/formation";

export default function FormationTags({ tags }: { tags: FormationTag[] }) {
  return tags.map((tag) => {
    const tagData = FORMATION_TAG.find((t) => t.tag === tag);

    if (!tagData) {
      return null;
    }

    return (
      <Tag key={"tag_" + tagData.tag} style={{ color: tagData.color, backgroundColor: tagData.bgColor }}>
        <Typography color={tagData.color} variant="body2" style={{ fontWeight: 700 }}>
          {tagData.tagLibelle}
        </Typography>
      </Tag>
    );
  });
}
