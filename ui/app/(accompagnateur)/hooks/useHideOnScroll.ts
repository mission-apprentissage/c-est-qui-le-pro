import { useWindowScroll } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

export const useHideOnScroll = (ref: React.RefObject<HTMLElement>, offset: number) => {
  const [hide, setHide] = useState(true);
  const [scrollPosition] = useWindowScroll();

  useEffect(() => {
    if (!ref?.current || scrollPosition.y === null) {
      return;
    }

    const boundingBox = ref.current.getBoundingClientRect();
    const headerStyle = window.getComputedStyle(ref.current);
    const marginSize = parseFloat(headerStyle.marginTop);

    if (boundingBox.y - offset <= marginSize) {
      setHide(true);
    } else if (boundingBox.y - offset > marginSize + 1) {
      setHide(false);
    }
  }, [ref, scrollPosition, offset]);

  return hide;
};
