import { useQuery } from "@tanstack/react-query";
import { fetchStyle } from "#/app/services/openmaptiles";

const academieSources = {
  academies: {
    type: "vector",
    tiles: [window.location.origin + "/academies/tiles/{z}/{x}/{y}.pbf"],
    minzoom: 5,
    maxzoom: 12,
  },
};

const academieLayers = (academie?: string) => [
  {
    id: "academies-outline",
    type: "line",
    source: "academies",
    "source-layer": "academies",
    filter: academie ? ["==", ["get", "academie"], academie] : ["==", "$type", "Polygon"],
    layout: {
      "line-cap": "round", // Options: "butt" | "round" | "square"
      "line-join": "round", // Options: "bevel" | "round" | "miter"
    },
    paint: {
      "line-color": "#2323ff",
      "line-width": 2,
      "line-opacity": 1,
      "line-dasharray": [3, 3],
    },
  },
];

export function useGetMapStyle(academie?: string | null) {
  return useQuery({
    queryKey: ["style", academie],
    queryFn: async () => {
      const baseStyle = await fetchStyle();

      if (!baseStyle) {
        throw new Error("Impossible to retrieve map style");
      }

      if (!academie) {
        return baseStyle;
      }

      // Transform style to add academie layer
      return {
        ...baseStyle,
        sources: { ...baseStyle.sources, ...academieSources },
        layers: [...baseStyle.layers, ...academieLayers(academie)],
      };
    },
    cacheTime: Infinity,
    staleTime: Infinity,
  });
}
