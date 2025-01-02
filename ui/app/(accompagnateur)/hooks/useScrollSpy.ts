import { useLayoutEffect, useState } from "react";

// Restrict value to be between the range [0, value]
const clamp = (value: number) => Math.max(0, value);

// Check if number is between two values
const isBetween = (value: number, floor: number, ceil: number) => value >= floor && value <= ceil;

export const useScrollspy = (ids: string[], offset: number = 0, noBoundingFirstLast: boolean = true) => {
  const [activeId, setActiveId] = useState("");

  useLayoutEffect(() => {
    const listener = () => {
      const scroll = window.scrollY;

      const position = ids
        .map((id) => {
          const element = document.getElementById(id);

          if (!element) return { id, top: -1, bottom: -1 };

          const rect = element.getBoundingClientRect();
          const top = clamp(rect.top + scroll - offset);
          const bottom = clamp(rect.bottom + scroll - offset);

          return { id, top, bottom };
        })
        .find(({ top, bottom }, index) => {
          if (noBoundingFirstLast && index === 0) {
            return scroll <= bottom;
          }

          if (noBoundingFirstLast && index === ids.length - 1) {
            return scroll >= top;
          }

          return isBetween(scroll, top, bottom);
        });

      setActiveId(position?.id || "");
    };

    listener();

    window.addEventListener("resize", listener);
    window.addEventListener("scroll", listener);

    return () => {
      window.removeEventListener("resize", listener);
      window.removeEventListener("scroll", listener);
    };
  }, [ids, offset, noBoundingFirstLast]);

  return activeId;
};
