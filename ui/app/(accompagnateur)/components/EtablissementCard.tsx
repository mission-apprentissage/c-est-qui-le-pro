/** @jsxImportSource @emotion/react */
import { useMemo } from "react";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { fr } from "@codegouvfr/react-dsfr";
import { DiplomeTypeLibelle, Etablissement } from "shared";
import TagEtablissement from "./TagEtablissement";
import { uniq } from "lodash-es";
import { formatAccessTime } from "#/app/utils/formation";
import { css } from "@emotion/react";
import { EtablissementContainerStyled } from "./EtablissementCard.styled";

export default function EtablissementCard({
  etablissement,
  latitude,
  longitude,
  onClick,
}: {
  etablissement: Etablissement;
  latitude?: string;
  longitude?: string;
  onClick?: (etablissement: Etablissement) => void;
}) {
  const niveauxDiplome = useMemo(
    () => uniq(etablissement.niveauxDiplome || []).map((n) => DiplomeTypeLibelle[n]),
    [etablissement]
  );

  return (
    <EtablissementContainerStyled className={onClick && "clickable"} onClick={() => onClick && onClick(etablissement)}>
      <Box className="tag">
        <TagEtablissement etablissement={etablissement} />
      </Box>

      <Typography variant="h5">{etablissement.libelle}</Typography>

      <Box className="info" css={css``}>
        <Box>
          <Box>
            <i className={fr.cx("ri-book-marked-line")} />
          </Box>
          <Typography>
            {`${etablissement.formationCount} formation${
              (etablissement.formationCount || 0) > 1 ? "s" : ""
            } (${niveauxDiplome.slice(0, niveauxDiplome.length > 1 ? niveauxDiplome.length - 1 : 1).join(", ")}${
              niveauxDiplome.length > 1 ? ` et ${niveauxDiplome[niveauxDiplome.length - 1]}` : ""
            }) pour cette recherche`}
          </Typography>
        </Box>
        <Box>
          <Typography>
            {etablissement.accessTime ? (
              <i className={fr.cx("fr-icon-bus-line")} />
            ) : (
              etablissement.distance && <i className={fr.cx("fr-icon-car-fill")} />
            )}
          </Typography>
          <Typography>
            {etablissement.accessTime
              ? formatAccessTime(etablissement.accessTime, etablissement.modalite)
              : etablissement.distance && `${Math.round(etablissement.distance / 1000)} km`}
          </Typography>
        </Box>
      </Box>
    </EtablissementContainerStyled>
  );
}
