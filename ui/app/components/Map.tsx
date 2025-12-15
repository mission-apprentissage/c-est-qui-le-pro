/** @jsxImportSource @emotion/react */
"use client";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import styled from "@emotion/styled";
import { ReactNode, useEffect, useRef } from "react";
import { ZoomControl, useMap, useMapEvents } from "react-leaflet";
import { LatLngTuple, LeafletMouseEvent } from "leaflet";
import dynamic from "next/dynamic";
import { useGetMapStyle } from "../(accompagnateur)/hooks/useGetMapStyle";
import MapAutoresize from "./map/MapAutoresize";
import { fr } from "@codegouvfr/react-dsfr";
import AttributionWithLegend from "./map/AttributionWithLegend";
import React from "react";

const VectorTileLayer = dynamic(() => import("react-leaflet-vector-tile-layer").then((mod) => mod), {
  ssr: false,
});
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });

const MapContainerStyled = styled(MapContainer)`
  & .leaflet-control-horizontal {
    display: flex;
    gap: 2rem;
    align-items: center;
    background-color: white !important;
  }

  & .leaflet-legend {
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${fr.colors.decisions.background.actionHigh.blueFrance.default};
    font-family: "Marianne", arial, sans-serif;
    font-size: 12px;
    font-style: normal;
    font-weight: 700;
    line-height: 20px;
  }
`;

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

const Map = function Map({
  center,
  children,
  academie,
}: {
  center: LatLngTuple;
  children?: ReactNode;
  academie?: string | null;
}) {
  return (
    <MapContainerStyled
      zoomControl={false}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      center={center}
      zoom={13}
      attributionControl={false}
    >
      <PreventFocus />
      <MapAutoresize />
      <TileLayer key={`map_academie_${academie}`} academie={academie} />
      {children}
      <RecenterAutomatically position={center} />

      <ZoomControl />

      <AttributionWithLegend>
        <>
          <svg width="30" height="10">
            <line
              x1="0"
              y1="5"
              x2="30"
              y2="5"
              stroke={"#2323ff"}
              strokeWidth={3}
              strokeOpacity={1}
              strokeDasharray={"5,5"}
            />
          </svg>
          <span>Limite de l’académie</span>
        </>
      </AttributionWithLegend>
    </MapContainerStyled>
  );
};

export default Map;
