"use client";
import React, { useEffect, useRef, useState } from "react";
import { forwardRef } from "react";

const IframeSirius = React.memo(
  forwardRef<HTMLDivElement, { url: string }>(({ url }, ref) => {
    const widgetCode = `<iframe style="width: 100%; height: 0px; margin-bottom: 2rem;" src="${url}"
    scrolling="no" frameBorder="0"></iframe>`;

    return <div ref={ref} dangerouslySetInnerHTML={{ __html: widgetCode }}></div>;
  })
);
IframeSirius.displayName = "IframeSirius";

export const WidgetSirius = React.memo(
  ({ params, fallbackComponent }: { fallbackComponent?: JSX.Element; params: string }) => {
    const [isNotFound, setIsNotFound] = useState(false);
    const [height, setHeight] = useState(0);
    const API_URL = process.env.NEXT_PUBLIC_SIRIUS_API_BASE_URL || "https://sirius.inserjeunes.beta.gouv.fr";

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      window.addEventListener("message", (e) => {
        if (ref.current && e.data?.siriusHeight) {
          // TODO: changer la vérification quand le widget n'existe pas
          if (e.data?.siriusHeight === 50) {
            setIsNotFound(true);
          } else {
            setIsNotFound(false);
          }
          setHeight(e.data.siriusHeight);
        }
      });
    });

    useEffect(() => {
      if (!ref.current) {
        return;
      }

      const iframe = ref.current.querySelector("iframe");
      if (iframe) {
        iframe.style.height = height + "px";
        iframe.style.display = isNotFound ? "none" : "block";
      }
    }, [isNotFound, height]);

    return <>{isNotFound ? fallbackComponent : <IframeSirius ref={ref} url={`${API_URL}/iframes/${params}`} />}</>;
  }
);
WidgetSirius.displayName = "WidgetSirius";

export default WidgetSirius;
