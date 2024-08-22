"use client";
import Header from "@codegouvfr/react-dsfr/Header";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { css } from "@emotion/css";
import { fr } from "@codegouvfr/react-dsfr";

export default function CustomHeader({
  title,
  tagline,
  quickAccessItems,
  withBetaTag = true,
}: {
  title: string;
  tagline?: string;
  quickAccessItems?: JSX.Element[];
  withBetaTag?: boolean;
}) {

  return (
    <Header
      className={css`
        ul {
          flex-grow: 1;
          li {
            flex-grow: 1;
          }
        }
        .${fr.cx("fr-header__tools")} {
          flex: 1 1 auto;
        }
      `}
      brandTop={
        <>
          RÉPUBLIQUE
          <br />
          FRANÇAISE
        </>
      }
      serviceTitle={
        <>
          {title}
          {withBetaTag ? (
            <>
              {" "}
              <Badge as="span" noIcon severity="success">
                Beta
              </Badge>
            </>
          ) : null}
        </>
      }
      serviceTagline={tagline}
      homeLinkProps={{
        href: "/",
        title,
      }}
      quickAccessItems={quickAccessItems}
    />
  );
}

CustomHeader.displayName = CustomHeader.name;
