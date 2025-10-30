"use client";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { ReactNode, RefObject, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ZoomControl, useMap, useMapEvent, useMapEvents } from "react-leaflet";
import { DivIcon, LatLngTuple, LeafletMouseEvent } from "leaflet";
import { renderToString } from "react-dom/server";
import dynamic from "next/dynamic";
import HomeIcon from "./icon/HomeIcon";
import EtablissementIcon from "./icon/EtablissementIcon";
import { useGetMapStyle } from "../(accompagnateur)/hooks/useGetMapStyle";

const VectorTileLayer = dynamic(() => import("react-leaflet-vector-tile-layer").then((mod) => mod), {
  ssr: false,
});
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

export const LeafletHomeIcon = new DivIcon({
  iconSize: [52, 58],
  iconAnchor: [26, 58],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon leaftlet-home-icon color-white",
  html: renderToString(<HomeIcon />),
});

export const LeafletEtablissementIcon = new DivIcon({
  iconSize: [52, 58],
  iconAnchor: [26, 58],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-white",
  html: renderToString(<EtablissementIcon />),
});

export const LeafletEtablissementOutsideAcademieIcon = new DivIcon({
  iconSize: [52, 58],
  iconAnchor: [26, 58],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-white",
  html: renderToString(<EtablissementIcon fill={"#F983F1"} />),
});

export const LeafletSelectedEtablissementIcon = new DivIcon({
  iconSize: [58, 64],
  iconAnchor: [29, 64],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-orange leaflet-icon-selected",
  html: renderToString(<EtablissementIcon />),
});

export const LeafletSelectedEtablissementOutsideAcademieIcon = new DivIcon({
  iconSize: [58, 64],
  iconAnchor: [29, 64],
  popupAnchor: [-3, -76],
  className: "custom-leaflet-icon color-pink leaflet-icon-selected",
  html: renderToString(<EtablissementIcon fill={"#F983F1"} />),
});

function MapAutoresize() {
  const map = useMap();
  const resizeObserver = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    resizeObserver.current = new ResizeObserver(() => {
      map.invalidateSize();
    });
    const container = map.getContainer();
    resizeObserver.current.observe(container);

    return () => {
      resizeObserver && resizeObserver.current && resizeObserver.current.disconnect();
    };
  }, [map]);
  return <></>;
}

function TileLayer({ academie }: { academie?: string | null }) {
  const map = useMap();
  const { data: style } = useGetMapStyle(academie);

  if (!map || !style) {
    return <></>;
  }
  return <VectorTileLayer styleUrl={style} />;
}

const RecenterAutomatically = ({ position }: { position: LatLngTuple }) => {
  const [lat, lng] = position;
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);
  return null;
};

function PreventFocus() {
  const map = useMap();
  map.getContainer().focus = () => {};
  return null;
}

export const MapClickHandler = ({ onClick }: { onClick?: (e: LeafletMouseEvent) => void }) => {
  const popupOpenRef = useRef(false);
  const map = useMap();

  useEffect(() => {
    const handlePopupOpen = () => {
      popupOpenRef.current = true;
    };

    const handlePopupClose = () => {
      setTimeout(() => {
        popupOpenRef.current = false;
      }, 100);
    };

    map.on("popupopen", handlePopupOpen);
    map.on("popupclose", handlePopupClose);

    return () => {
      map.off("popupopen", handlePopupOpen);
      map.off("popupclose", handlePopupClose);
    };
  }, [map]);

  useMapEvents({
    click: (e) => {
      if (!popupOpenRef.current) {
        onClick && onClick(e);
      }
    },
  });

  return null;
};

export function FitBound({ groupRef }: { groupRef: RefObject<L.FeatureGroup | null> }) {
  const [isLoading, setIsLoading] = useState(true);

  const map = useMapEvent("layeradd", () => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    if (bounds.isValid()) {
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [groupRef, isLoading]);

  useEffect(() => {
    if (isLoading || !groupRef?.current) {
      return;
    }

    const bounds = groupRef.current.getBounds();
    map.fitBounds(bounds);
  }, [isLoading, groupRef, map]);
  return null;
}

export default function Map({
  center,
  children,
  academie,
}: {
  center: LatLngTuple;
  children?: ReactNode;
  academie?: string | null;
}) {
  const [unmountMap, setUnmountMap] = useState(false);
  //to prevent map re-initialization
  useLayoutEffect(() => {
    setUnmountMap(false);
    return () => {
      setUnmountMap(true);
    };
  }, []);

  if (unmountMap) {
    return <></>;
  }

  return (
    <MapContainer
      zoomControl={false}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      center={center}
      zoom={13}
    >
      <PreventFocus />
      <MapAutoresize />
      <TileLayer academie={academie} />
      {children}
      <RecenterAutomatically position={center} />

      <ZoomControl />
    </MapContainer>
  );
}
