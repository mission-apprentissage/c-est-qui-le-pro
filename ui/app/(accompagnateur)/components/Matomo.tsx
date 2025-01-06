"use client";

import { useConsent } from "#/app/components/ConsentManagement";
import { init, push } from "@socialgouv/matomo-next";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

function sanitizeUrl(str: string): string {
  let strSanitized = str.replace(/address=([^&]*)/, "address=***");
  strSanitized = strSanitized.replace(/latitude=([^&]*)/, "latitude=***");
  strSanitized = strSanitized.replace(/longitude=([^&]*)/, "longitude=***");
  strSanitized = strSanitized.replace(/latitudeA=([^&]*)/, "latitudeA=***");
  strSanitized = strSanitized.replace(/longitudeA=([^&]*)/, "longitudeA=***");
  return strSanitized;
}

export function Matomo() {
  const { finalityConsent } = useConsent();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const searchParamsString = searchParams.toString();

  useEffect(() => {
    if (!finalityConsent?.analytics) {
      return;
    }

    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "",
      url: process.env.NEXT_PUBLIC_MATOMO_URL || "",
      disableCookies: true,
      onInitialization: () => {
        const url = pathname + (searchParamsString ? "?" + sanitizeUrl(searchParamsString) : "");
        push(["setCustomUrl", url]);
        push(["setReferrerUrl", sanitizeUrl(document?.referrer)]);
      },
    });
  }, [finalityConsent, pathname, searchParamsString]);

  return null;
}
