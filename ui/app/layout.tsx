import RootLayout from "./components/RootLayout";
import Layout from "./components/Layout";
import Header from "#/app/components/Header";
import { title, tagline } from "./(accompagnateur)/constants/constants";
import "./(accompagnateur)/style.scss";
import Title from "./(accompagnateur)/components/Title";
import { Footer } from "@codegouvfr/react-dsfr/Footer";
import Link from "./components/Link";
import { ConsentBannerAndConsentManagement } from "./components/ConsentManagement";
import ConstructionHeader from "./(accompagnateur)/components/ConstructionHeader";

export default function MainLayout({ children }: { children: JSX.Element }) {
  return (
    <RootLayout>
      <>
        <Title />
        <Layout header={<Header title={title} tagline={tagline} />} title={title}>
          <div>
            <ConstructionHeader />
            {children}
            {/* <ConsentBannerAndConsentManagement /> */}
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
              accessibility="non compliant"
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
                  text: "Documentation",
                  linkProps: { href: "/documentation", target: "_blank" },
                },
              ]}
            />
          </div>
        </Layout>
      </>
    </RootLayout>
  );
}