"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

export default function MapAutoresize() {
  const map = useMap();
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.current.observe(container);

    return () => {
      if (resizeObserver && resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
    };
  }, [map]);
  return <></>;
}
