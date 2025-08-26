"use client";

import { useConsent } from "#/app/components/ConsentManagement";
import { push } from "@socialgouv/matomo-next";
import { useCallback, useMemo } from "react";

export const useMatomo = () => {
  const { finalityConsent } = useConsent();
  const pushWithConsent = useCallback(
    (...args: Parameters<typeof push>): void => {
      // We use matomo without cookie when we don't have the consent.
      // No need to filter the events
      // if (!finalityConsent?.analytics) {
      //   return;
      // }

      push(args[0]);
    },
    [finalityConsent]
  );

  const matomo = useMemo(() => {
    return { push: pushWithConsent };
  }, [pushWithConsent]);

  return matomo;
};
