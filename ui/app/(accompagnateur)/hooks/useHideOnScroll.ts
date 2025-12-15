import { useWindowScroll } from "@uidotdev/usehooks";
import { useEffect, useState } from "react";

export const useHideOnScroll = (ref: React.RefObject<HTMLElement | null>, offset: number) => {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHide(true);
    } else if (boundingBox.y - offset > marginSize + 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHide(false);
    }
  }, [ref, scrollPosition, offset]);

  return hide;
};
