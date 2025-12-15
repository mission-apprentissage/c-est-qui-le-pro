"use client";

import { DivIcon } from "leaflet";
import { renderToString } from "react-dom/server";
import HomeIcon from "../icon/HomeIcon";
import EtablissementIcon from "../icon/EtablissementIcon";

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
  html: renderToString(<EtablissementIcon fill={"#fcc0b4"} />),
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
  html: renderToString(<EtablissementIcon fill={"#fcc0b4"} />),
});
