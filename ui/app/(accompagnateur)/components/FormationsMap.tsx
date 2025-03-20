"use client";
import React, { useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  LeafletHomeIcon,
  LeafletEtablissementIcon,
  LeafletSelectedEtablissementIcon,
  FitBound,
  MapClickHandler,
} from "#/app/components/Map";
import { Etablissement, FormationDetail } from "shared";
import { FeatureGroup, Marker } from "react-leaflet";
import EtablissementCard from "./EtablissementCard";
import DynamicPopup from "./DynamicPopup";
import L, { LeafletMouseEvent } from "leaflet";

const Map = dynamic(() => import("#/app/components/Map"), { ssr: false });

export default function FormationsMap({
  latitude,
  longitude,
  etablissements,
  selected,
  onMarkerClick,
  onMarkerHomeDrag,
}: {
  latitude: number;
  longitude: number;
  etablissements: any[];
  selected?: FormationDetail | null;
  onMarkerClick?: (etablissement: Etablissement) => void;
  onMarkerHomeDrag?: (lat: number, lng: number) => void;
}) {
  const groupRef = useRef<L.FeatureGroup>(null);
  const markerRef = useRef<L.Marker>(null);

  const homeMarkerEventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const latLng = marker.getLatLng();
          onMarkerHomeDrag && onMarkerHomeDrag(latLng.lat, latLng.lng);
        }
      },
      click: () => {}, // Prevent marker move when clicking on it
    }),
    [onMarkerHomeDrag]
  );

  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      onMarkerHomeDrag && onMarkerHomeDrag(e.latlng.lat, e.latlng.lng);
    },
    [onMarkerHomeDrag]
  );

  const handleMapClick = useCallback(
    (e: LeafletMouseEvent) => {
      onMarkerHomeDrag && onMarkerHomeDrag(e.latlng.lat, e.latlng.lng);
    },
    [onMarkerHomeDrag]
  );

  return (
    <Map center={[latitude, longitude]}>
      <FeatureGroup ref={groupRef}>
        {etablissements.map((etablissement: Etablissement) => {
          const key = `marker_${etablissement.uai}`;
          const isSelected = selected?.etablissement.uai === etablissement.uai;

          if (!etablissement.latitude || !etablissement.longitude) {
            return null;
          }

          return (
            <Marker
              icon={isSelected ? LeafletSelectedEtablissementIcon : LeafletEtablissementIcon}
              zIndexOffset={isSelected ? 10500 : 0}
              key={key}
              position={[etablissement.latitude, etablissement.longitude]}
              bubblingMouseEvents={false}
              eventHandlers={{
                click: (e) => {
                  onMarkerClick && onMarkerClick(etablissement);
                },
              }}
            >
              <DynamicPopup
                offsets={{
                  n: new L.Point(0, -50),
                  ne: new L.Point(0, -50),
                  nw: new L.Point(0, -50),
                  s: new L.Point(0, 0),
                }}
                bounds={{
                  y: 100,
                }}
              >
                <EtablissementCard
                  etablissement={etablissement}
                  latitude={latitude.toString()}
                  longitude={longitude.toString()}
                />
              </DynamicPopup>
            </Marker>
          );
        })}

        <Marker
          ref={markerRef}
          eventHandlers={homeMarkerEventHandlers}
          icon={LeafletHomeIcon}
          zIndexOffset={100000}
          position={[latitude, longitude]}
          draggable={true}
          bubblingMouseEvents={false}
        >
          {/* <Tooltip>
          <Typography variant="subtitle1">Ma position</Typography>
        </Tooltip> */}
        </Marker>
      </FeatureGroup>

      {etablissements.length && <FitBound key={etablissements.length} groupRef={groupRef} />}

      <MapClickHandler onClick={handleMapClick} />
    </Map>
  );
}
