/** @jsxImportSource @emotion/react */
"use client";
import { useMemo } from "react";
import { css } from "@emotion/react";
import { Typography } from "#/app/components/MaterialUINext";
import { getDistance } from "geolib";
import { fr } from "@codegouvfr/react-dsfr";
import { Etablissement } from "shared";
import { formatAccessTime } from "#/app/utils/formation";
import { StyledButtonLink } from "./FormationHeader";

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

  return (
    <>
      <Typography variant="h5" style={{ color: "var(--blue-france-sun-113-625)", marginBottom: fr.spacing("3v") }}>
        <StyledButtonLink
          noIcon
          noDecoration
          href={`https://www.google.com/maps/dir/?api=1&origin=${
            latitude && longitude ? encodeURIComponent(latitude + "," + longitude) : ""
          }&destination=${encodeURIComponent(address)}&travelmode=transit`}
          target="_blank"
        >
          {etablissement.accessTime && (
            <span style={{ marginRight: "1rem" }}>
              <i className={fr.cx("fr-icon-bus-line")} style={{ marginRight: fr.spacing("1w") }} />
              {formatAccessTime(etablissement.accessTime, etablissement.modalite)}
            </span>
          )}
          {!etablissement.accessTime && distance !== null && (
            <span style={{ marginRight: "1rem" }}>
              <i className={fr.cx("fr-icon-car-fill")} style={{ marginRight: fr.spacing("1w") }} />À{" "}
              {Math.round(distance / 1000)} km
            </span>
          )}
          <i className={fr.cx("ri-arrow-right-line", "fr-icon--sm")} style={{ marginRight: fr.spacing("2v") }} />
        </StyledButtonLink>
      </Typography>
    </>
  );
}
