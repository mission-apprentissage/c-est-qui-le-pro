/** @jsxImportSource @emotion/react */
"use client";
import { JSX, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { formation } from "#/app/queries/formation/query";
import Loader from "#/app/components/Loader";
import { notFound } from "next/navigation";
import Title from "#/app/(accompagnateur)/components/Title";
import FormationContent from "./FormationContent";
import { FormationDetail } from "shared";
import useGetFormations from "../../hooks/useGetFormations";

function FormationPrefetch({
  formationDetail,
  children,
}: {
  formationDetail: FormationDetail;
  children: JSX.Element | JSX.Element[];
}) {
  const { isLoading: isLoadingFormationAutreVoie } = useGetFormations({
    cfds: [formationDetail.formation.cfd],
    uais: [formationDetail.etablissement.uai],
  });

  if (isLoadingFormationAutreVoie) {
    return <Loader withMargin />;
  }

  return children;
}

function FormationResult({ id, latitude, longitude }: { id: string; latitude?: string; longitude?: string }) {
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
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    <FormationPrefetch formationDetail={data}>
      <Title
        pageTitle={`Détails de la formation ${data.formation.libelle} dans l'établissement ${data.etablissement.libelle}`}
      />
      <FormationContent formationDetail={data} />
    </FormationPrefetch>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { latitude?: string; longitude?: string };
}) {
  return (
    <>
      <Suspense>
        <FormationResult id={params.id} latitude={searchParams.latitude} longitude={searchParams.longitude} />
      </Suspense>
    </>
  );
}
