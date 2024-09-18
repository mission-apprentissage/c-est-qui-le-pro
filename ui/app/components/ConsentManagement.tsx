"use client";

import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";

export const {
  ConsentBannerAndConsentManagement,
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
  useConsent,
} = createConsentManagement({
  finalityDescription: ({ lang }) => ({
    analytics: {
      title: "Analyse",
      description: "Nous utilisons des cookies pour mesurer l’audience de notre site et améliorer son contenu.",
    },
    // personalization: {
    //   title: "Personnalisation",
    //   description: "Nous utilisons des cookies pour vous proposer des contenus adaptés à vos centres d’intérêts.",
    // },
  }),
});
