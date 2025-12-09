"use client";

import { RefObject, useEffect, useState } from "react";
import { useMapEvent } from "react-leaflet";

export default function FitBound({ groupRef }: { groupRef: RefObject<L.FeatureGroup | null> }) {
  const [isLoading, setIsLoading] = useState(true);

  const map = useMapEvent("layeradd", () => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(false);
      }
    }
  }, [groupRef, isLoading]);

  useEffect(() => {
    if (isLoading || !groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    map.fitBounds(bounds);
  }, [isLoading, groupRef, map]);
  return null;
}
