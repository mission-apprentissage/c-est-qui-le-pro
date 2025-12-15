"use client";
/** @jsxImportSource @emotion/react */
import ResearchFormationsResult from "./ResearchFormationsResult";
import { useEffect } from "react";
import { useFormationsSearch } from "../context/FormationsSearchContext";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../errors/ErrorUserGeolocation";
import UserGeolocatioDenied from "../components/UserGeolocatioDenied";
import { useRouter } from "next/navigation";
import { useGetAddressWithCity } from "../hooks/useGetAddress";
import { LoaderContainer, LoadingMessage } from "./page.styled";

export function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top
    window.scrollTo(0, 0);
  }, []);

  return <></>;
}

export function ResearchFormationsParameter({
  initialLocation,
  initialFormations,
}: {
  initialLocation?: {
    longitude: number;
    latitude: number;
    city: string;
    postcode: string;
  } | null;
  initialFormations?: any;
}) {
  const router = useRouter();
  const { params } = useFormationsSearch();
  const { address } = params ?? {};

  useEffect(() => {
    if (!address) {
      router.push(`/`);
    }
  }, [address, router]);

  // If we have initial location from server, use it; otherwise fetch client-side
  const {
    data: clientLocation,
    isLoading,
    isFetching,
    error,
  } = useGetAddressWithCity(initialLocation ? undefined : address);

  // Use server-provided location or fall back to client location
  const location = initialLocation || clientLocation;

  if (!params || !params.address) {
    return null;
  }

  if (error && error instanceof ErrorUserGeolocation) {
    return <UserGeolocatioDenied />;
  }

  if (!initialLocation && isLoading) {
    return (
      <LoaderContainer>
        <Loader withMargin />
        <LoadingMessage variant="h6">Nous recherchons toutes les formations autour de toi...</LoadingMessage>
      </LoaderContainer>
    );
  }

  return (
    <>
      {location && (
        <ResearchFormationsResult
          location={location}
          page={1}
          isAddressFetching={isFetching}
          initialFormations={initialFormations}
        />
      )}
    </>
  );
}
