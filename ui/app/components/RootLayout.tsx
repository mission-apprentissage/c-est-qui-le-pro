import { DsfrHead } from "@codegouvfr/react-dsfr/next-appdir/DsfrHead";
import { getHtmlAttributes } from "@codegouvfr/react-dsfr/next-appdir/getHtmlAttributes";
import StartDsfr from "#/app/StartDsfr";
import { defaultColorScheme } from "#/app/defaultColorScheme";
import Link from "next/link";
import { LogRocketInitializer } from "./LogRocketInitializer";
import { Plausible } from "./Plausible";
import { Suspense } from "react";

export default function RootLayout({ title, children }: { title?: string; children: JSX.Element }) {
  const lang = "fr";
  return (
    <html
      {...getHtmlAttributes({ defaultColorScheme, lang })}
      style={{
        overflow: "-moz-scrollbars-vertical",
        overflowY: "scroll",
      }}
      // TODO: Temporary disable hydratation warning because caused by chrome extension
      suppressHydrationWarning={true}
    >
      <head>
        {title && <title>{title}</title>}
        <StartDsfr />
        <DsfrHead
          Link={Link}
          preloadFonts={[
            "Marianne-Regular",
            "Marianne-Medium",
            // //"Marianne-Light",
            // //"Marianne-Light_Italic",
            // "Marianne-Regular",
            // //"Marianne-Regular_Italic",
            // "Marianne-Medium",
            // //"Marianne-Medium_Italic",
            // "Marianne-Bold",
            // //"Marianne-Bold_Italic",
            // //"Spectral-Regular",
            // //"Spectral-ExtraBold"
          ]}
        />
        <Suspense>
          <Plausible />
          <LogRocketInitializer />
        </Suspense>
      </head>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </body>
    </html>
  );
}