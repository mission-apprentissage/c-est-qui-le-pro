"use client";
import React from "react";

// Conditionally import useResizeObserver only on client
// eslint-disable-next-line @typescript-eslint/no-require-imports
const useResizeObserver = typeof window !== "undefined" ? require("@react-hook/resize-observer").default : () => {};

export const useSize = (target: React.RefObject<HTMLElement | null>) => {
  const [size, setSize] = React.useState<DOMRect>();

  React.useEffect(() => {
    target.current && setSize(target.current.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, (entry: ResizeObserverEntry) => setSize(entry.contentRect as DOMRect));
  return size;
};
