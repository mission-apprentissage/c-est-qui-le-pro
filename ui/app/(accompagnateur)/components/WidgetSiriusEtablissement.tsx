"use client";
import React, { JSX } from "react";
import { WidgetSirius } from "./WidgetSirius";
import { Etablissement } from "shared";

export default function WidgetSiriusEtablissement({
  etablissement,
  fallbackComponent,
}: {
  fallbackComponent?: JSX.Element;
  etablissement: Etablissement;
}) {
  return <WidgetSirius params={`etablissement?uai=${etablissement.uai}`} fallbackComponent={fallbackComponent} />;
}
