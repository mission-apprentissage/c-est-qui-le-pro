/** @jsxImportSource @emotion/react */
"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { css } from "@emotion/react";
import { useLocalStorage } from "usehooks-ts";
import Button from "#/app/components/Button";
import MailSendIcon from "#/app/components/icon/MailSendIcon";
import Link from "#/app/components/Link";
import { Box, Typography } from "#/app/components/MaterialUINext";
import { useEffect, useState } from "react";

export default function ConstructionHeader() {
  const [isClient, setIsClient] = useState(false);
  const [displayConstructionHeader, saveDisplayConstructionHeader] = useLocalStorage<boolean>(
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
                  style={{ color: fr.colors.decisions.text.title.blueFrance.default, backgroundImage: "none" }}
                  href="/documentation"
                >
                  consulter notre documentation
                </Link>{" "}
                pour tout savoir du projet.
              </Typography>
            </Box>
            <Box style={{ marginTop: "0.5rem" }}>
              <Link href="mailto:contact@inserjeunes.beta.gouv.fr">
                <Button style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                  <Box style={{ display: "flex", alignItems: "center" }}>
                    <MailSendIcon style={{ marginRight: "0.5rem", width: "1rem", height: "1rem" }} />
                    Rejoindre l’expérimentation !
                  </Box>
                </Button>
              </Link>
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
