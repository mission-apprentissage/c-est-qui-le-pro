"use client";
import PlausibleProvider from "next-plausible";
import { useConsent } from "./ConsentManagement";

export function Plausible() {
  const { finalityConsent } = useConsent();

  return (
    finalityConsent?.analytics && (
      <PlausibleProvider
        domain={process.env.NEXT_PUBLIC_DOMAIN || ""}
        trackOutboundLinks={true}
        taggedEvents={true}
      ></PlausibleProvider>
    )
  );
}
