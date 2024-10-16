"use client";
import React from "react";
import { Formation } from "shared";
import { WidgetSirius } from "./WidgetSirius";

export default function WidgetSiriusFormation({
  formation,
  fallbackComponent,
}: {
  fallbackComponent?: JSX.Element;
  formation: Formation;
}) {
  if (!formation.libelle) {
    return fallbackComponent;
  }

  return (
    <WidgetSirius params={`formation?intitule=${encodeURI(formation.libelle)}`} fallbackComponent={fallbackComponent} />
  );
}
