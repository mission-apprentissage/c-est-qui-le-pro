/** @jsxImportSource @emotion/react */
"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import { useSessionStorage } from "usehooks-ts";
import { Box, Typography } from "#/app/components/MaterialUINext";

export default function NewNameHeader({ onClose }: { onClose?: () => void }) {
  return (
    <Box
      style={{
        backgroundColor: fr.colors.decisions.artwork.decorative.blueFrance.default,
        position: "relative",
      }}
    >
      <Box
        style={{
          maxWidth: "78rem",
          padding: "1.5rem",
          paddingRight: "3rem",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
        }}
      >
        <Box style={{ marginRight: "1rem" }}>
          <i
            style={{ color: fr.colors.decisions.text.title.blueFrance.default }}
            className={fr.cx("ri-information-line")}
          ></i>
        </Box>
        <Box>
          <Box>
            <Typography variant="subtitle3">
              <b>C’est qui le pro ?</b> change de nom pour devenir <b>Futur Pro</b>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        css={css`
          color: ${fr.colors.decisions.text.title.blueFrance.default};
          :hover {
            background-color: ${fr.colors.decisions.background.raised.grey.hover};
            cursor: pointer;
          }
        `}
        style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }}
        onClick={onClose}
      >
        <i className={fr.cx("ri-close-fill")}></i>
      </Box>
    </Box>
  );
}
