import { useEffect, useRef } from "react";

export default function useScrollToLocation() {
  const lastHash = useRef("");

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash && hash !== lastHash.current) {
        lastHash.current = hash;
        const element = document.getElementById(hash.slice(1));
        if (element) {
          // Delay to ensure DOM is ready (e.g., after text truncation)
          setTimeout(() => {
            element.scrollIntoView({ block: "start" });
          }, 0);
        }
      }
    };

    checkHash();
    const interval = setInterval(checkHash, 100);
    return () => clearInterval(interval);
  }, []);
}
