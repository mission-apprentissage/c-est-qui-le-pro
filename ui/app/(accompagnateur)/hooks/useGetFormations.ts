"use client";
import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formations as formationsQuery } from "#/app/queries/formations/query";
import { FormationDomaine, FormationTag } from "#/types/formation";

export default function useGetFormations({
  latitude,
  longitude,
  distance,
  time,
  tag,
  domaine,
  uais,
  cfds,
  page,

  items_par_page = 100,
}: {
  latitude?: number;
  longitude?: number;
  distance?: number;
  time?: number;
  tag?: FormationTag | null;
  domaine?: FormationDomaine | null;
  uais?: string[];
  cfds?: string[];
  page?: number;
  items_par_page?: number;
}) {
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
    //keepPreviousData: true,
    queryKey: [
      "formations",
      latitude,
      longitude,
      distance,
      time,
      tag,
      domaine,
      page,
      uais?.toString(),
      cfds?.toString(),
    ],
    queryFn: ({ pageParam, signal }) => {
      return formationsQuery(
        {
          latitude,
          longitude,
          distance,
          timeLimit: time,
          tag,
          domaine,
          page: pageParam ?? 1,
          items_par_page,
          cfds,
          uais,
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

  const fetchNextPage = useCallback(() => {
    hasNextPage && !isFetchingNextPage && !isFetching ? queryFetchNextPage() : null;
  }, [hasNextPage, isFetchingNextPage, isFetching, queryFetchNextPage]);

  const formations = useMemo(() => (data ? data.pages.flatMap((page) => page.formations) : []), [data]);

  const etablissements = useMemo(() => {
    const etablissements: Record<string, any> = {};
    formations.forEach((formation) => {
      etablissements[formation.etablissement.uai] = formation.etablissement;
    });
    return Object.values(etablissements);
  }, [formations]);

  return { isLoading, fetchNextPage, isFetchingNextPage, formations, etablissements };
}