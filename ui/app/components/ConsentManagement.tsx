"use client";
import { useLocalStorage } from "usehooks-ts";
import { useSearchParams } from "next/navigation";
import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";
import { useEffect } from "react";

export const {
  ConsentBannerAndConsentManagement,
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
  useConsent,
} = {
  ...createConsentManagement({
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
  }),
  useConsent: () => {
    // Override useConsent for now (experimentation)
    const searchParams = useSearchParams();
    const disableTrackingParams = searchParams.get("notracking") ? searchParams.get("notracking") === "true" : null;
    const [disableTracking, saveDisableTracking] = useLocalStorage<boolean>(
      "disableTracking",
      disableTrackingParams !== null ? disableTrackingParams : false
    );

    useEffect(() => {
      if (disableTrackingParams !== null) {
        saveDisableTracking(disableTrackingParams);
      }
    }, [disableTrackingParams]);

    return {
      finalityConsent: { analytics: !disableTracking },
    };
  },
};
