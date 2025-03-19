"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import Title from "../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../errors/ErrorUserGeolocation";
import ErrorAddressInvalid from "../errors/ErrorAddressInvalid";
import UserGeolocatioDenied from "../components/UserGeolocatioDenied";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { FormationDomaine } from "shared";
import { myPosition } from "#/app/components/form/AddressField";
import { useRouter } from "next/navigation";
import SearchFormationFiltersForm from "#/app/components/form/SearchFormationFiltersForm";

function ResearchFormationsParameter() {
  const router = useRouter();
  const { params, updateParams } = useFormationsSearch();
  const [isFirstRender, setIsFirstRender] = useState(true);
  const { address, tag, domaines, formation, voie } = params ?? {};

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  useEffect(() => {
    if (!address) {
      router.push(`/`);
    }
  }, [address]);

  const { data, isLoading, isFetching, error } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["coordinate", address],
    keepPreviousData: !isFirstRender,
    queryFn: async ({ signal }) => {
      if (!address) {
        return null;
      }

      const addressCoordinate = await fetchAddress(address);
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
      <Box
        display="flex"
        alignItems="center"
        flexDirection={"column"}
        sx={{ height: "100vh", padding: { md: "2rem", xs: "1rem" }, paddingTop: { md: "5rem", xs: "5rem" } }}
      >
        <Loader withMargin />
        <Typography variant="h6" textAlign={"center"}>
          Nous recherchons toutes les formations autour de toi...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={0}>
        <Grid
          item
          xs={12}
          lg={12}
          xl={12}
          sx={{
            border: { sm: "none", md: "1px solid #DDDDDD" },
            boxShadow: { sm: "none", md: "0 4px 4px -4px #00000040" },
            padding: "1rem",
            paddingLeft: { md: "2.5rem" },
            paddingRight: { md: "2.5rem" },
            paddingBottom: { sm: "0", md: "1rem" },
            zIndex: 999,
          }}
        >
          <SearchFormationFiltersForm />
        </Grid>
      </Grid>
      {data && (
        <ResearchFormationsResult
          location={data}
          tag={tag}
          domaines={domaines}
          formation={formation}
          voie={voie}
          page={1}
          isAddressFetching={isFetching}
        />
      )}
    </>
  );
}

export default function Page() {
  return (
    <div>
      <Title pageTitle="Recherche de formations" />
      <Suspense>
        <SearchHeader />
        <FormationsSearchProvider>
          <ResearchFormationsParameter />
        </FormationsSearchProvider>
      </Suspense>
    </div>
  );
}
