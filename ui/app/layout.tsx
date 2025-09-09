import RootLayout from "./components/RootLayout";
import Layout from "./components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./(accompagnateur)/constants/constants";
import "./(accompagnateur)/style.scss";
import Title from "./(accompagnateur)/components/Title";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import Link from "./components/Link";
import Button from "./components/Button";
import { JSX } from "react";
import { ConsentBannerAndConsentManagement } from "./components/ConsentManagement";

export default function MainLayout({ children }: { children: JSX.Element }) {
  return (
    <RootLayout>
      <>
        <Title />
        <Layout
          header={
            <Header
              title={title}
              tagline={tagline}
              quickAccessItems={[
                <Link key={"donner-votre-avis"} noIcon target="_blank" href="https://tally.so/r/wz0AOR">
                  <Button iconId="ri-emotion-happy-fill" priority="tertiary">
                    Donner votre avis
                  </Button>
                </Link>,
              ]}
            />
          }
          title={title}
        >
          <div>
            {children}
            <ConsentBannerAndConsentManagement />
            <Footer
              brandTop={
                <>
                  RÉPUBLIQUE
                  <br />
                  FRANÇAISE
                </>
              }
              homeLinkProps={{
                href: "/",
                title,
              }}
              termsLinkProps={{ href: "/mentions-legales" }}
              accessibility="non compliant"
              accessibilityLinkProps={{ href: "/accessibilite" }}
              contentDescription={
                <>
                  <b>C&apos;est qui le pro ?</b> est un service de la{" "}
                  <Link href="https://beta.gouv.fr/incubateurs/mission-inserjeunes.html" target="_blank">
                    Mission interministérielle InserJeunes
                  </Link>
                  , mandatée par plusieurs ministères pour développer des produits destinés à faciliter l’orientation et
                  l’insertion des jeunes de la voie professionnelle. Le code source de ce site web est disponible en
                  licence libre. Une partie du design de ce service est conçu avec le système de design de l&apos;État.
                </>
              }
              bottomItems={[
                {
                  text: "Conditions générales d'utilisation",
                  linkProps: { href: "/cgu" },
                },
                {
                  text: "Politique de confidentialité",
                  linkProps: { href: "/politique-de-confidentialite" },
                },
                {
                  text: "Documentation",
                  linkProps: { href: "/documentation", target: "_blank" },
                },
                {
                  text: "Statistiques",
                  linkProps: { href: "/stats", target: "_blank" },
                },
                {
                  text: "Nous contacter",
                  linkProps: { href: "https://tally.so/r/wz0AOR", target: "_blank" },
                },
              ]}
            />
          </div>
        </Layout>
      </>
    </RootLayout>
  );
}
