/** @jsxImportSource @emotion/react */
"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { formation } from "#/app/queries/formation/query";
import Loader from "#/app/components/Loader";
import { notFound } from "next/navigation";
import FormationContent from "./FormationContent";
import { FormationDetail } from "shared";
import { PaginationsFormation } from "#/types/pagination";
import useGetFormations from "../../hooks/useGetFormations";
import { useGetReverseLocation } from "../../hooks/useGetAddress";

function FormationPrefetch({
  formationDetail,
  initialFormationsAutreVoie,
  children,
}: {
  formationDetail: FormationDetail;
  initialFormationsAutreVoie?: PaginationsFormation<"formations", FormationDetail> | null;
  children: React.ReactNode;
}) {
  const { isLoading: isLoadingFormationAutreVoie } = useGetFormations({
    cfds: [formationDetail.formation.cfd],
    uais: [formationDetail.etablissement.uai],
    initialData: initialFormationsAutreVoie ?? undefined,
  });

  if (isLoadingFormationAutreVoie) {
    return <Loader withMargin />;
  }

  return children;
}

export function FormationResult({
  id,
  latitude,
  longitude,
  initialFormationDetail,
  initialFormationsAutreVoie,
}: {
  id: string;
  latitude?: string;
  longitude?: string;
  initialFormationDetail?: FormationDetail | null;
  initialFormationsAutreVoie?: PaginationsFormation<"formations", FormationDetail> | null;
}) {
  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", id, latitude, longitude],
    queryFn: ({ signal }) => {
      return formation(
        {
          id: id,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        },
        { signal }
      );
    },
    initialData: initialFormationDetail ?? undefined,
  });

  useGetReverseLocation({
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
  });

  const formationDetail = data || initialFormationDetail;

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    formationDetail && (
      <FormationPrefetch formationDetail={formationDetail} initialFormationsAutreVoie={initialFormationsAutreVoie}>
        <FormationContent formationDetail={formationDetail} />
      </FormationPrefetch>
    )
  );
}
