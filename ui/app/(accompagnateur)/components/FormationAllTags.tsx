"use client";
import React from "react";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { FormationTag } from "#/types/formation";
import Tag from "#/app/components/Tag";
import { FORMATION_TAG, FormationTagType } from "#/app/services/formation";

function FilterTag({
  tagElt,
  selected,
  onClick,
}: {
  tagElt: FormationTagType;
  selected?: FormationTag | null;
  onClick?: (tag: FormationTag) => void;
}) {
  return (
    <Tag
      variant="filter"
      active={selected === tagElt.tag}
      nativeButtonProps={{
        onClick: function () {
          onClick && onClick(tagElt.tag);
        },
      }}
    >
      {typeof tagElt.icon === "function" ? (
        <Box style={{ marginRight: "0.25rem", marginBottom: "-0.25rem" }}>
          <tagElt.icon />
        </Box>
      ) : (
        <i
          style={{ color: "white", marginRight: fr.spacing("2v") }}
          className={"fr-icon--sm " + fr.cx(tagElt.icon)}
        ></i>
      )}

      <Typography variant="body2" style={{ fontWeight: 700 }}>
        {tagElt.libelle}
      </Typography>
    </Tag>
  );
}

export default function FormationAllTags({
  selected,
  onClick,
}: {
  selected?: FormationTag | null;
  onClick?: (tag: FormationTag) => void;
}) {
  return FORMATION_TAG.map((tagElt) => {
    return <FilterTag key={"tag_" + tagElt.tag} tagElt={tagElt} selected={selected} onClick={onClick} />;
  });
}
