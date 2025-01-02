import { useWindowScroll } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

export const useHideOnScroll = (ref: React.RefObject<HTMLElement>) => {
  const [hide, setHide] = useState(true);
  const [scrollPosition] = useWindowScroll();

  useEffect(() => {
    if (!ref?.current || scrollPosition.y === null) {
      return;
    }

    const boundingBox = ref.current.getBoundingClientRect();
    const headerStyle = window.getComputedStyle(ref.current);
    const marginSize = parseFloat(headerStyle.marginTop);

    if (boundingBox.y <= marginSize) {
      setHide(true);
    } else if (boundingBox.y > marginSize) {
      setHide(false);
    }
  }, [ref, scrollPosition]);

  return hide;
};
