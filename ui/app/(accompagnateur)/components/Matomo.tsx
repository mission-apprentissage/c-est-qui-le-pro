"use client";

import { init, push } from "@socialgouv/matomo-next";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function MatomoAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    init({
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || "",
      url: process.env.NEXT_PUBLIC_MATOMO_URL || "",
      disableCookies: true,
    });
  }, []);

  return null;
}
