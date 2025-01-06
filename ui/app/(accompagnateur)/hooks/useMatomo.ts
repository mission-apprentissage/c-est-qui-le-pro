"use client";

import { useConsent } from "#/app/components/ConsentManagement";
import { push } from "@socialgouv/matomo-next";
import { useCallback } from "react";

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
  return { push: pushWithConsent };
};
