"use client";
import React from "react";
import { Etablissement } from "#/types/formation";
import { WidgetSirius } from "./WidgetSirius";

export default function WidgetSiriusEtablissement({
  etablissement,
  fallbackComponent,
}: {
  fallbackComponent?: JSX.Element;
  etablissement: Etablissement;
}) {
  return <WidgetSirius params={`etablissement?uai=${etablissement.uai}`} fallbackComponent={fallbackComponent} />;
}
