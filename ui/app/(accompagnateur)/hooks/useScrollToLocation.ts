import { useParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export default function useScrollToLocation() {
  const params = useParams();
  const getHash = useCallback(() => (typeof window !== "undefined" ? window.location.hash : undefined), []);
  useEffect(() => {
    const hash = getHash();
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);

      if (element) {
        // Little hack to scroll after text truncation
        setTimeout(() => {
          element.scrollIntoView({ block: "start" });
        }, 0);
      }
    }
  }, [params, getHash]);
}
