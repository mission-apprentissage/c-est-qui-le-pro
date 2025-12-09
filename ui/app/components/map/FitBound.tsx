"use client";

import { RefObject, useLayoutEffect, useRef } from "react";
import { useMap, useMapEvent } from "react-leaflet";

export default function FitBound({ groupRef }: { groupRef: RefObject<L.FeatureGroup | null> }) {
  const hasFittedBoundsRef = useRef(false);
  const map = useMap();

  useMapEvent("layeradd", (e) => {
    const map = e.target;
    if (hasFittedBoundsRef.current || !groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      hasFittedBoundsRef.current = true;
      map.fitBounds(bounds);
    }
  });

  useLayoutEffect(() => {
    if (hasFittedBoundsRef.current || !groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      hasFittedBoundsRef.current = true;
      map.fitBounds(bounds);
    }
  }, [groupRef, map]);

  return null;
}
