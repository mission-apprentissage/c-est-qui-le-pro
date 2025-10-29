import React from "react";
import { Box } from "@mui/material";
import "moment/locale/fr";
import { formatStatut } from "#/app/utils/formation";
import { TagStatutPrive, TagStatutPublic } from "#/app/components/Tag";
import { capitalize } from "lodash-es";
import { Etablissement } from "shared";

export default function TagEtablissement({ etablissement }: { etablissement: Etablissement }) {
  return (
    etablissement.statut && (
      <Box>
        {etablissement.statut === "public" ? (
          <TagStatutPublic>{capitalize(formatStatut(etablissement))}</TagStatutPublic>
        ) : (
          <TagStatutPrive>{capitalize(formatStatut(etablissement))}</TagStatutPrive>
        )}
      </Box>
    )
  );
}
