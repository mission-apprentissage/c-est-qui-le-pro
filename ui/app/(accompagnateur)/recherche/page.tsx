/** @jsxImportSource @emotion/react */
"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense, useEffect, useState } from "react";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import Title from "../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../errors/ErrorUserGeolocation";
import ErrorAddressInvalid from "../errors/ErrorAddressInvalid";
import UserGeolocatioDenied from "../components/UserGeolocatioDenied";
import { myPosition } from "#/app/components/form/AddressField";
import { useRouter } from "next/navigation";
import SearchFormationFiltersForm from "#/app/components/form/SearchFormationFiltersForm";
import { useGetAddress } from "../hooks/useGetAddress";
import { HeaderContainer, LoaderContainer, LoadingMessage } from "./page.styled";

function ResearchFormationsParameter() {
  const router = useRouter();
  const { params, updateParams } = useFormationsSearch();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { address } = params ?? {};

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  useEffect(() => {
    if (!address) {
      router.push(`/`);
    }
  }, [address]);

  const { data, isLoading, isFetching, error } = useGetAddress(address, {
    select: (addressCoordinate: Awaited<ReturnType<typeof fetchAddress>>) => {
      if (!addressCoordinate?.features) {
        // TODO: manage address fetch error
        throw new ErrorAddressInvalid();
      }

      const coordinate = addressCoordinate.features[0].geometry.coordinates;

      return {
        coordinate,
        longitude: coordinate[0],
        latitude: coordinate[1],
        city: address === myPosition ? myPosition : addressCoordinate.features[0].properties.city,
        postcode: addressCoordinate.features[0].properties.postcode,
      };
    },
  });

  if (!params || !params.address) {
    return null;
  }

  if (error && error instanceof ErrorUserGeolocation) {
    return <UserGeolocatioDenied />;
  }

  if (isLoading) {
    return (
      <LoaderContainer>
        <Loader withMargin />
        <LoadingMessage variant="h6">Nous recherchons toutes les formations autour de toi...</LoadingMessage>
      </LoaderContainer>
    );
  }

  return <>{data && <ResearchFormationsResult location={data} page={1} isAddressFetching={isFetching} />}</>;
}

export default function Page() {
  return (
    <>
      <Title pageTitle="Recherche de formations" />
      <Suspense>
        <FormationsSearchProvider>
          <HeaderContainer>
            <SearchHeader />
            <SearchFormationFiltersForm />
          </HeaderContainer>

          <ResearchFormationsParameter />
        </FormationsSearchProvider>
      </Suspense>
    </>
  );
}
