"use client";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "#/app/components/MaterialUINext";
import { getDistance } from "geolib";
import { formationRoute } from "#/app/queries/formation/route/query";
import Loader from "#/app/components/Loader";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "#/types/formation";
import moment from "moment";

export default function FormationRoute({
  etablissement,
  longitude,
  latitude,
}: {
  etablissement: Etablissement;
  longitude?: string | null;
  latitude?: string | null;
}) {
  const address = etablissement.addressStreet + ", " + etablissement.addressPostCode + " " + etablissement.addressCity;

  const distance = useMemo(() => {
    if (!latitude || !longitude || etablissement.latitude === undefined || etablissement.longitude === undefined) {
      return null;
    }

    return getDistance(
      { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
      {
        latitude: etablissement.latitude,
        longitude: etablissement.longitude,
      },
      0.01
    );
  }, [longitude, latitude, etablissement.latitude, etablissement.longitude]);

  const { isLoading, isError, data } = useQuery({
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: 0,
    queryKey: ["formation", latitude, longitude, etablissement.latitude, etablissement.longitude],
    queryFn: ({ signal }) => {
      if (!latitude || !longitude) {
        return null;
      }

      return formationRoute(
        {
          latitudeA: latitude,
          longitudeA: longitude,
          latitudeB: (etablissement.latitude ?? "").toString(),
          longitudeB: (etablissement.longitude ?? "").toString(),
        },
        { signal }
      );
    },
  });

  const timeRoute = useMemo(() => {
    if (!data?.paths?.length) {
      return null;
    }

    const legs = data.paths[0].legs;
    const departure = moment(legs[0].departure_time);
    const arrival = moment(legs[legs.length - 1].arrival_time);
    return arrival.diff(departure);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <Typography
        variant="subtitle4"
        style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}
      >
        {timeRoute !== null && (
          <span style={{ marginRight: fr.spacing("3v") }}>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />À{" "}
            {(timeRoute / 1000 / 60).toFixed(0)} minutes
          </span>
        )}
        {!data?.paths && distance !== null && (
          <span style={{ marginRight: fr.spacing("3v") }}>
            <i className={fr.cx("fr-icon-bus-fill")} style={{ marginRight: fr.spacing("1w") }} />À{" "}
            {(distance / 1000).toFixed(2)} km
          </span>
        )}

        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${
            latitude && longitude ? encodeURIComponent(latitude + "," + longitude) : ""
          }&destination=${encodeURIComponent(address)}&travelmode=transit`}
          target="_blank"
        >
          Voir le trajet
        </a>
      </Typography>
    </>
  );
}