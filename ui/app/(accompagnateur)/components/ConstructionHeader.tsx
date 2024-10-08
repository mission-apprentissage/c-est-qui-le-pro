/** @jsxImportSource @emotion/react */
"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import { useSessionStorage } from "usehooks-ts";
import MailSendIcon from "#/app/components/icon/MailSendIcon";
import Link from "#/app/components/Link";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { useEffect, useState } from "react";

export default function ConstructionHeader() {
  const [isClient, setIsClient] = useState(false);
  const [displayConstructionHeader, saveDisplayConstructionHeader] = useSessionStorage<boolean>(
    "displayConstructionHeader",
    true
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    isClient &&
    displayConstructionHeader && (
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
                Bonjour, ce service est en cours d’expérimentation et de construction en Bretagne et en Île-de-France.
                <br /> Vous pouvez{" "}
                <Link
                  noIcon
                  target="_blank"
                  style={{ color: fr.colors.decisions.text.title.blueFrance.default, backgroundImage: "none" }}
                  href="/documentation/cbb52155b2bb43d1af3e28bd632d83a7"
                >
                  consulter notre documentation
                </Link>{" "}
                ou encore{" "}
                <Link
                  noIcon
                  href="mailto:contact@inserjeunes.beta.gouv.fr"
                  style={{ color: fr.colors.decisions.text.title.blueFrance.default, backgroundImage: "none" }}
                >
                  <MailSendIcon style={{ verticalAlign: "text-top", marginLeft: "0.25rem", marginRight: "0.5rem" }} />
                  Rejoindre l’expérimentation !
                </Link>
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
          style={{ position: "absolute", right: "1rem", top: "1rem" }}
          onClick={() => saveDisplayConstructionHeader(false)}
        >
          <i className={fr.cx("ri-close-fill")}></i>
        </Box>
      </Box>
    )
  );
}
