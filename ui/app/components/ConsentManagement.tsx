"use client";
import { useLocalStorage } from "usehooks-ts";
import { useSearchParams } from "next/navigation";
import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";
import { useEffect, useMemo } from "react";
import { UseConsent } from "@codegouvfr/react-dsfr/consentManagement/useConsent";

const { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem, useConsent } =
  createConsentManagement({
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
    consentCallback: async ({ finalityConsent, finalityConsent_prev }) => {
      if (finalityConsent_prev === undefined) {
        location.reload();
      }
    },
  });

const useConsentOverride = ((useConsent: UseConsent<"analytics">) => () => {
  // Override useConsent for now (experimentation)
  const searchParams = useSearchParams();
  const disableTrackingParams = searchParams.get("notracking") ? searchParams.get("notracking") === "true" : null;
  const [disableTracking, saveDisableTracking] = useLocalStorage<boolean>(
    "disableTracking",
    disableTrackingParams !== null ? disableTrackingParams : false
  );

  const { finalityConsent } = useConsent();

  const consent = useMemo(() => {
    return {
      finalityConsent: { ...finalityConsent, analytics: finalityConsent?.analytics && !disableTracking },
    };
  }, [disableTracking, finalityConsent]);

  useEffect(() => {
    if (disableTrackingParams !== null) {
      saveDisableTracking(disableTrackingParams);
    }
  }, [saveDisableTracking, disableTrackingParams]);

  return consent;
})(useConsent);

export {
  ConsentBannerAndConsentManagement,
  FooterConsentManagementItem,
  FooterPersonalDataPolicyItem,
  useConsentOverride as useConsent,
};
