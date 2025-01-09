"use client";

import { useConsent } from "#/app/components/ConsentManagement";
import { push } from "@socialgouv/matomo-next";
import { useCallback, useMemo } from "react";

export const useMatomo = () => {
  const { finalityConsent } = useConsent();
  const pushWithConsent = useCallback(
    (...args: Parameters<typeof push>): void => {
      if (!finalityConsent?.analytics) {
        return;
      }

      push(args[0]);
    },
    [finalityConsent]
  );

  const matomo = useMemo(() => {
    return { push: pushWithConsent };
  }, [pushWithConsent]);

  return matomo;
};
