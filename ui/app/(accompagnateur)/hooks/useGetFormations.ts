"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formations as formationsQuery } from "#/app/queries/formations/query";
import { DiplomeType, FormationDomaine, FormationTag, FormationVoie } from "shared";
import { RegionsService } from "shared";

export default function useGetFormations({
  latitude,
  longitude,
  tag,
  domaines,
  voie,
  diplome,
  recherche,
  uais,
  cfds,
  postcode,
  insideAcademieForCar = true,
  minWeight = 101,
  page,
  items_par_page = 100,
}: {
  latitude?: number;
  longitude?: number;
  tag?: FormationTag[];
  domaines?: FormationDomaine[];
  voie?: FormationVoie[];
  diplome?: (keyof typeof DiplomeType)[];
  recherche?: string | null;
  uais?: string[];
  cfds?: string[];
  postcode?: string;
  insideAcademieForCar?: boolean;
  minWeight?: number;
  page?: number;
  items_par_page?: number;
}) {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const academie = RegionsService.findAcademieByPostcode(postcode || "");
  const {
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage: queryFetchNextPage,
    hasNextPage,
    data,
  } = useInfiniteQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
    keepPreviousData: !isFirstRender,
    queryKey: [
      "formations",
      latitude,
      longitude,
      tag?.toString(),
      voie?.toString(),
      diplome?.toString(),
      domaines?.toString(),
      recherche,
      page,
      uais?.toString(),
      cfds?.toString(),
      academie,
      minWeight,
    ],
    queryFn: ({ pageParam, signal }) => {
      return formationsQuery(
        {
          latitude,
          longitude,
          distance: 0,
          timeLimit: 5400,
          tag,
          voie,
          diplome,
          domaines,
          recherche,
          page: pageParam ?? 1,
          items_par_page,
          cfds,
          uais,
          academie: insideAcademieForCar ? academie : null,
          minWeight,
        },
        { signal }
      );
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.pagination.nombre_de_page === 0 ||
        !lastPage.pagination ||
        lastPage.pagination.nombre_de_page === lastPage.pagination.page
        ? undefined
        : lastPage.pagination.page + 1;
    },
    useErrorBoundary: true,
  });

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, []);

  const fetchNextPage = useCallback(() => {
    hasNextPage && !isFetchingNextPage && !isFetching ? queryFetchNextPage() : null;
  }, [hasNextPage, isFetchingNextPage, isFetching, queryFetchNextPage]);

  const pagination = useMemo(() => (data ? data.pages[0].pagination : null), [data]);
  const formations = useMemo(() => (data ? data.pages.flatMap((page) => page.formations) : []), [data]);

  const etablissements = useMemo(() => {
    const etablissements: Record<string, any> = {};
    formations.forEach((formation) => {
      etablissements[formation.etablissement.uai] = formation.etablissement;
    });
    return Object.values(etablissements);
  }, [formations]);

  return { isLoading, fetchNextPage, isFetching, isFetchingNextPage, formations, etablissements, academie, pagination };
}
