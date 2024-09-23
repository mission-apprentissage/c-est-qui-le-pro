/** @jsxImportSource @emotion/react */
"use client";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { formation } from "#/app/queries/formation/query";
import Loader from "#/app/components/Loader";
import { notFound } from "next/navigation";
import Title from "#/app/(accompagnateur)/components/Title";
import FormationContent from "./FormationContent";

function FormationResult({ id }: { id: string }) {
  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", id],
    queryFn: ({ signal }) => {
      return formation({ id: id }, { signal });
    },
  });

  if (isLoading) {
    return <Loader withMargin />;
  }

  if (isError || !data) {
    return notFound();
  }

  return (
    <>
      <Title
        pageTitle={`Détails de la formation ${data.formation.libelle} dans l'établissement ${data.etablissement.libelle}`}
      />
      <FormationContent formationDetail={data} />
    </>
  );
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Suspense>
        <FormationResult id={params.id} />
      </Suspense>
    </>
  );
}
