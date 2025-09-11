/** @jsxImportSource @emotion/react */
"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { Suspense, useEffect, useState } from "react";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import Title from "../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../errors/ErrorUserGeolocation";
import UserGeolocatioDenied from "../components/UserGeolocatioDenied";
import { useRouter } from "next/navigation";
import SearchFormationFiltersForm from "#/app/components/form/SearchFormationFiltersForm";
import { useGetAddressWithCity } from "../hooks/useGetAddress";
import { HeaderContainer, LoaderContainer, LoadingMessage } from "./page.styled";
import FocusSearchProvider from "../context/FocusSearchContext";

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

  const { data, isLoading, isFetching, error } = useGetAddressWithCity(address);

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
          <FocusSearchProvider>
            <HeaderContainer>
              <SearchHeader />
              <SearchFormationFiltersForm />
            </HeaderContainer>

            <ResearchFormationsParameter />
          </FocusSearchProvider>
        </FormationsSearchProvider>
      </Suspense>
    </>
  );
}
