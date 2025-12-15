import RootLayout from "./components/RootLayout";
import Layout from "./components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./(accompagnateur)/constants/constants";
import "./(accompagnateur)/style.scss";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import Link from "./components/Link";
import Button from "./components/Button";
import { ConsentBannerAndConsentManagement } from "./components/ConsentManagement";
import NewNameHeaderClient from "./(accompagnateur)/components/NewNameHeaderClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: title,
    template: `${title} - %s`,
  },
  description: "Toutes les formations pro accessibles après la 3e",
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootLayout>
      <>
        <Layout
          header={
            <Header
              title={title}
              tagline={tagline}
              quickAccessItems={[
                <Link key={"donner-votre-avis"} noIcon target="_blank" href="https://tally.so/r/wz0AOR">
                  <Button iconId="ri-emotion-happy-fill" priority="tertiary">
                    Donner son avis
                  </Button>
                </Link>,
              ]}
            />
          }
          title={title}
        >
          <div>
            <NewNameHeaderClient></NewNameHeaderClient>
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
                  <b>Futur Pro</b> est un service de la{" "}
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
                  linkProps: {
                    href: `https://documentation.${process.env.NEXT_PUBLIC_DOMAIN}/`,
                    target: "_blank",
                  },
                },
                {
                  text: "Statistiques",
                  linkProps: {
                    href: `https://statistiques.${process.env.NEXT_PUBLIC_DOMAIN}/`,
                    target: "_blank",
                  },
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
