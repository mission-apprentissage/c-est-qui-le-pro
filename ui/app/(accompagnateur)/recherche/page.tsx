"use client";
import ResearchFormationsResult from "./ResearchFormationsResult";
import { fetchAddress } from "#/app/services/address";
import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import FormationsSearchProvider, { useFormationsSearch } from "../context/FormationsSearchContext";
import SearchHeader from "../components/SearchHeader";
import Title from "../components/Title";
import Loader from "#/app/components/Loader";
import ErrorUserGeolocation from "../errors/ErrorUserGeolocation";
import ErrorAddressInvalid from "../errors/ErrorAddressInvalid";
import UserGeolocatioDenied from "../components/UserGeolocatioDenied";
import { Box, Grid, Typography } from "#/app/components/MaterialUINext";
import { capitalize } from "lodash-es";
import { FormationDomaine } from "shared";
import { FORMATION_DOMAINE } from "#/app/services/formation";
import OptionsCarousel from "#/app/components/form/OptionsCarousel";
import { myPosition } from "#/app/components/form/AddressField";
import { useRouter } from "next/navigation";

function ResearchFormationsParameter() {
  const router = useRouter();
  const { params, updateParams } = useFormationsSearch();
  const { address, tag, domaine, formation } = params ?? {};

  useEffect(() => {
    if (!address) {
      router.push(`/`);
    }
  }, [address]);

  const { data, isLoading, error } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["coordinate", address],
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
            border: "1px solid #DDDDDD",
            boxShadow: "0 4px 4px -4px #00000040",
            padding: { md: "1.5rem", xs: "1rem" },
            paddingLeft: { md: "1.75rem" },
            paddingRight: { md: "1.75rem" },
            zIndex: 99,
          }}
        >
          <OptionsCarousel
            defaultValue={FormationDomaine["tout"]}
            selected={domaine ? [domaine] : []}
            options={FORMATION_DOMAINE.map(({ domaine, icon }) => ({
              option: capitalize(domaine),
              icon: icon,
              value: domaine,
            }))}
            onClick={(selected) => {
              if (!params) {
                return;
              }

              updateParams({
                ...params,
                domaine: selected === FormationDomaine["tout"] || selected === domaine ? undefined : selected,
              });
            }}
          />
        </Grid>
      </Grid>
      {data && <ResearchFormationsResult location={data} tag={tag} domaine={domaine} formation={formation} page={1} />}
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
