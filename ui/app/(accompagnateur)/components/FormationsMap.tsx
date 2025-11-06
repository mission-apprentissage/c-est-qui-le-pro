"use client";
import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import {
  LeafletHomeIcon,
  LeafletEtablissementIcon,
  LeafletEtablissementOutsideAcademieIcon,
  LeafletSelectedEtablissementOutsideAcademieIcon,
  LeafletSelectedEtablissementIcon,
  FitBound,
  MapClickHandler,
} from "#/app/components/Map";
import { Etablissement, FormationDetail } from "shared";
import { FeatureGroup, Marker } from "react-leaflet";
import EtablissementCard from "./EtablissementCard";
import DynamicPopup from "./DynamicPopup";
import L from "leaflet";

const Map = dynamic(() => import("#/app/components/Map"), { ssr: false });

function scrollToTooltip(event: L.PopupEvent) {
  const map = event.target as L.Map;
  const container = map.getContainer();
  const containerRect = container.getBoundingClientRect();
  const elt = event.popup.getElement();

  if (!elt) return;

  const waitForContent = () => {
    const contentElement = elt.querySelector(".etablissement-card");
    const eltRect = elt.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (!contentElement) {
      requestAnimationFrame(waitForContent);
      return;
    }

    if (containerRect.y < 1) {
      return;
    }

    if (containerRect.bottom - containerRect.y < eltRect.bottom) {
      window.scrollTo({
        top: Math.min(containerRect.y + scrollTop, eltRect.bottom - containerRect.bottom + containerRect.y + scrollTop),
        behavior: "smooth",
      });
    }
  };

  requestAnimationFrame(waitForContent);
}

export default function FormationsMap({
  latitude,
  longitude,
  etablissements,
  academie,
  selected,
  onMarkerClick,
  onMarkerHomeDrag,
  onTooltipClick,
}: {
  latitude: number;
  longitude: number;
  etablissements: any[];
  academie?: string | null;
  selected?: FormationDetail | null;
  onMarkerClick?: (etablissement: Etablissement) => void;
  onMarkerHomeDrag?: (lat: number, lng: number) => void;
  onTooltipClick?: (etablissement: Etablissement) => void;
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

  return (
    <Map academie={academie} center={[latitude, longitude]}>
      <FeatureGroup ref={groupRef}>
        {etablissements.map((etablissement: Etablissement) => {
          const key = `marker_${etablissement.uai}`;
          const isSelected = selected?.etablissement.uai === etablissement.uai;

          if (!etablissement.latitude || !etablissement.longitude) {
            return null;
          }

          return (
            <Marker
              icon={
                etablissement.academie === academie
                  ? isSelected
                    ? LeafletSelectedEtablissementIcon
                    : LeafletEtablissementIcon
                  : isSelected
                  ? LeafletSelectedEtablissementOutsideAcademieIcon
                  : LeafletEtablissementOutsideAcademieIcon
              }
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
                minWidth={330}
                onOpen={scrollToTooltip}
              >
                <EtablissementCard
                  etablissement={etablissement}
                  academie={academie}
                  onClick={() => onTooltipClick && onTooltipClick(etablissement)}
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
        ></Marker>
      </FeatureGroup>

      {etablissements.length && <FitBound key={etablissements.length} groupRef={groupRef} />}

      <MapClickHandler />
    </Map>
  );
}
