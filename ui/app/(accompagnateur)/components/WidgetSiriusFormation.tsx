"use client";
import React, { JSX } from "react";
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

  return <WidgetSirius params={`formation?cfd=${encodeURI(formation.cfd)}`} fallbackComponent={fallbackComponent} />;
}
