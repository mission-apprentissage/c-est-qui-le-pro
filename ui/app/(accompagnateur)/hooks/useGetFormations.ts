"use client";
import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formations as formationsQuery } from "#/app/queries/formations/query";
import { FormationDomaine, FormationTag, FormationVoie } from "shared";
import { RegionsService } from "shared";

export default function useGetFormations({
  latitude,
  longitude,
  tag,
  domaines,
  voie,
  formation,
  uais,
  cfds,
  postcode,
  page,
  items_par_page = 100,
}: {
  latitude?: number;
  longitude?: number;
  tag?: FormationTag | null;
  domaines?: FormationDomaine[];
  voie?: FormationVoie[];
  formation?: string | null;
  uais?: string[];
  cfds?: string[];
  postcode?: string;
  page?: number;
  items_par_page?: number;
}) {
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
    //keepPreviousData: true,
    queryKey: [
      "formations",
      latitude,
      longitude,
      tag,
      voie?.toString(),
      domaines?.toString(),
      formation,
      page,
      uais?.toString(),
      cfds?.toString(),
      academie,
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
          domaines,
          formation,
          page: pageParam ?? 1,
          items_par_page,
          cfds,
          uais,
          academie,
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

  const pagination = useMemo(() => (data ? data.pages[0].pagination : null), [data]);
  const formations = useMemo(() => (data ? data.pages.flatMap((page) => page.formations) : []), [data]);

  const etablissements = useMemo(() => {
    const etablissements: Record<string, any> = {};
    formations.forEach((formation) => {
      etablissements[formation.etablissement.uai] = formation.etablissement;
    });
    return Object.values(etablissements);
  }, [formations]);

  return { isLoading, fetchNextPage, isFetchingNextPage, formations, etablissements, pagination };
}
