/** @jsxImportSource @emotion/react */
"use client";
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { css } from "@emotion/react";
import { useInView } from "react-intersection-observer";
import { Typography, Grid, Grid2 } from "../../components/MaterialUINext";
import InformationCard from "#/app/components/InformationCard";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import FormationCard from "../components/FormationCard";
import ClientSideScrollRestorer from "#/app/components/ClientSideScrollRestorer";
import dynamic from "next/dynamic";
import { FormationDetail } from "shared";
import { Box, Theme, useMediaQuery, useTheme } from "@mui/material";
import useGetFormations from "../hooks/useGetFormations";
import { useFormationsSearch } from "../context/FormationsSearchContext";
import { isNil } from "lodash-es";
import { UserLocation } from "#/types/userLocation";
import { pluralize } from "#/app/utils/stringUtils";
import { fetchReverse } from "#/app/services/address";
const FormationsMap = dynamic(() => import("#/app/(accompagnateur)/components/FormationsMap"), {
  ssr: false,
});

const FormationResult = React.memo(
  ({
    formationRef,
    formationDetail,
    latitude,
    longitude,
    isSelected,
    setSelected,
    index,
  }: {
    formationRef: React.RefObject<HTMLDivElement | null>;
    formationDetail: FormationDetail;
    latitude: number;
    longitude: number;
    isSelected: boolean;
    setSelected: React.Dispatch<React.SetStateAction<FormationDetail | null>>;
    index: number;
  }) => {
    const cb = useCallback(() => {
      setSelected(formationDetail);
    }, [formationDetail, setSelected]);

    return (
      <Grid item xs={12} ref={formationRef}>
        <Box sx={{ maxWidth: { xs: "100%", lg: "100%" } }}>
          <FormationCard
            selected={isSelected}
            onMouseEnter={cb}
            latitude={latitude}
            longitude={longitude}
            formationDetail={formationDetail}
            tabIndex={index}
          />
        </Box>
      </Grid>
    );
  }
);
FormationResult.displayName = "FormationResult";

const FormationResults = React.memo(
  ({
    formationsRef,
    formations,
    location,
    setSelected,
    selected,
    pagination,
  }: {
    formationsRef: React.RefObject<HTMLDivElement | null>[];
    formations: FormationDetail[];
    location: UserLocation;
    setSelected: React.Dispatch<React.SetStateAction<FormationDetail | null>>;
    selected: null | FormationDetail;
    pagination:
      | ({
          page: number;
          items_par_page: number;
          nombre_de_page: number;
          total: number;
        } & {
          totalIsochrone: number;
        })
      | null;
  }) => {
    const formationsIsochrone = useMemo(
      () => formations.filter((f) => !isNil(f.etablissement.accessTime)),
      [formations]
    );
    const formationsCar = useMemo(() => formations.filter((f) => isNil(f.etablissement.accessTime)), [formations]);

    const totalIsochrone = useMemo(() => pagination?.totalIsochrone || 0, [pagination]);
    const totalCar = useMemo(
      () => (pagination ? pagination.total - (pagination.totalIsochrone || 0) : 0),
      [pagination]
    );

    return (
      <>
        <Grid container rowSpacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6">
              À pied ou en transports en commun : {totalIsochrone} {pluralize("formation", totalIsochrone)}
            </Typography>
          </Grid>

          {formationsIsochrone.map((formationDetail, index) => {
            const { formation, formationEtablissement, etablissement } = formationDetail;
            const key = `${formation.cfd}-${formation.codeDispositif}-${etablissement.uai}-${formation.voie}`;

            return (
              <FormationResult
                key={key}
                latitude={location.latitude}
                longitude={location.longitude}
                formationRef={formationsRef[index]}
                setSelected={setSelected}
                isSelected={selected ? selected.formationEtablissement.id === formationEtablissement.id : false}
                formationDetail={formationDetail}
                index={index}
              />
            );
          })}
        </Grid>

        {formationsCar.length > 0 && (
          <Grid container spacing={2} style={{ marginTop: "2rem" }}>
            <Grid item xs={12}>
              <Typography variant="h6">
                Un peu plus loin dans l&apos;académie, en voiture : {totalCar} {pluralize("formation", totalCar)}
              </Typography>
            </Grid>

            {formationsCar.map((formationDetail, index) => {
              const mainIndex = formationsIsochrone.length + index;
              const { formation, formationEtablissement, etablissement } = formationDetail;
              const key = `${formation.cfd}-${formation.codeDispositif}-${etablissement.uai}-${formation.voie}`;

              return (
                <FormationResult
                  key={key}
                  latitude={location.latitude}
                  longitude={location.longitude}
                  formationRef={formationsRef[mainIndex]}
                  setSelected={setSelected}
                  isSelected={selected ? selected.formationEtablissement.id === formationEtablissement.id : false}
                  formationDetail={formationDetail}
                  index={mainIndex}
                />
              );
            })}
          </Grid>
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    // Ignore location, we want to refresh only if the formations changed
    return (
      prevProps.formations === nextProps.formations &&
      prevProps.formationsRef === nextProps.formationsRef &&
      prevProps.pagination === nextProps.pagination &&
      prevProps.selected === nextProps.selected &&
      prevProps.setSelected === nextProps.setSelected
    );
  }
);
FormationResults.displayName = "FormationResults";

export default React.memo(function ResearchFormationsResult({
  location,
  page = 1,
  isAddressFetching,
}: {
  location: UserLocation;
  page: number;
  isAddressFetching?: boolean;
}) {
  const theme = useTheme();
  const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down("md"));
  const [selected, setSelected] = useState<null | FormationDetail>(null);
  const [latLng, setLatLng] = useState<number[] | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [isNewAddressLoading, setIsNewAddressLoading] = useState(false);
  const { params, updateParams } = useFormationsSearch();
  const { tag, domaines, recherche, voie, diplome, minWeight } = params ?? {};

  const { ref: refInView, inView } = useInView();

  const { isLoading, fetchNextPage, isFetching, isFetchingNextPage, formations, etablissements, pagination } =
    useGetFormations({
      latitude: location.latitude,
      longitude: location.longitude,
      tag,
      page,
      domaines,
      voie,
      diplome,
      postcode: location.postcode,
      recherche,
      minWeight,
    });
  const formationsRef = useMemo(() => formations.map((data) => React.createRef<HTMLDivElement>()), [formations]);

  React.useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  useEffect(() => {
    if (!latLng) {
      return;
    }

    setIsNewAddressLoading(true);
    (async () => {
      try {
        const result = await fetchReverse(latLng[0], latLng[1]);
        if (result?.features?.length > 0) {
          const address = result.features[0].properties.label;
          updateParams({ ...params, address: address });
        } else {
          setLatLng(null);
          setIsNewAddressLoading(false);
        }
      } catch (err) {}
      // TODO: erreur quand pas d'adresse trouvée
    })();
  }, [params, latLng]);

  useEffect(() => {
    if (!isAddressFetching) {
      setIsNewAddressLoading(false);
      setLatLng(null);

      var eltPosition = resultRef.current?.getBoundingClientRect();
      if (eltPosition?.y !== undefined && eltPosition?.y < 0) {
        resultRef.current?.scrollIntoView();
      }
    }
  }, [isAddressFetching]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        flexDirection={"column"}
        sx={{ height: "100vh", padding: { md: "2rem", xs: "1rem" }, paddingTop: { md: "5rem", sm: "5rem" } }}
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
      <Suspense>
        <ClientSideScrollRestorer />
      </Suspense>

      <Grid2 container spacing={0} direction={isDownSm ? "column-reverse" : "row"} ref={resultRef}>
        <Grid2
          md={8}
          lg={8}
          xl={8}
          sm={12}
          css={css`
            max-width: 784px;
            padding: 1.5rem;
            padding-top: 0rem;
            ${theme.breakpoints.up("md")} {
              padding-top: 2rem;
            }
            padding-left: 2.5rem;
            padding-right: 3rem;
            z-index: 500;
            width: 100%;
            ${theme.breakpoints.up("lg")} {
              padding-left: 2.5rem;
            }
          `}
        >
          {(isNewAddressLoading || isFetching || isAddressFetching) && <Loader withMargin />}

          {!formations?.length ? (
            <InformationCard>
              <Typography variant="subtitle1">
                Nous n’avons pas trouvé de formation proche correspondant à cette recherche
              </Typography>
              <Typography>
                Attention, cet outil est un prototype destiné à être testé en Île-de-France et en Bretagne. En dehors de
                ces régions, le service proposé sera incomplet et dégradé lors de cette phase d’expérimentation.
              </Typography>
              <br />
              <Typography>De plus, la liste des formations renvoyées peut être incomplète car : </Typography>
              <ul>
                <li>certaines formations ne sont pas encore référencées,</li>
                <li>
                  toutes les modalités de transport ne sont pas encore intégrées (notamment les transports scolaires).
                </li>
              </ul>
              <br />
              <Typography>
                Nous vous invitons donc à compléter votre recherche sur Onisep.fr, la plateforme d’orientation de votre
                région, les sites des établissements, etc.
              </Typography>
              <br />
              <Typography>Bonne recherche !</Typography>
            </InformationCard>
          ) : (
            <FormationResults
              formations={formations}
              formationsRef={formationsRef}
              location={location}
              pagination={pagination}
              selected={selected}
              setSelected={setSelected}
            />
          )}
        </Grid2>

        <Grid2
          xs
          css={css`
            top: 0;
            position: sticky;
            height: 100vh;
            width: 100%;
            ${theme.breakpoints.down("md")} {
              height: 40vh;
              z-index: 600;
              flex-basis: auto;
              display: none;
            }
          `}
        >
          {!isDownSm && (
            <FormationsMap
              selected={selected}
              longitude={(latLng && latLng[1]) || location.longitude}
              latitude={(latLng && latLng[0]) || location.latitude}
              etablissements={etablissements}
              onMarkerHomeDrag={(lat, lng) => {
                setLatLng([lat, lng]);
              }}
              onMarkerClick={(etablissement) => {
                const formationIndex = formations.findIndex((f) => f.etablissement.uai === etablissement.uai);
                if (formationIndex === -1) {
                  return;
                }

                const formation = formations[formationIndex];
                const formationRef = formationsRef[formationIndex];
                setSelected(formation);
                formationRef?.current && formationRef?.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            />
          )}
        </Grid2>
      </Grid2>
      <div ref={refInView}></div>
      {isFetchingNextPage && <Loader style={{ marginTop: fr.spacing("5v") }} />}
    </>
  );
});
