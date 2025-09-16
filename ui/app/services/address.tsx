import { JSX } from "react";
import ErrorUserGeolocation from "../(accompagnateur)/errors/ErrorUserGeolocation";
import { myPosition } from "../components/form/AddressField";
import { fr } from "@codegouvfr/react-dsfr";
import MarseilleIcon from "../components/icon/MarseilleIcon";
import LimogesIcon from "../components/icon/LimogesIcon";
import ParisIcon from "../components/icon/ParisIcon";
import GuilvinecIcon from "../components/icon/GuilvinecIcon";
import { StyledSvgIcon } from "../components/icon/Icon.styled";

const API_BASE_URL = "https://api-adresse.data.gouv.fr";

export const CITIES_SUGGESTION: { text: string; address: string; icon: () => JSX.Element }[] = [
  {
    text: "Autour de moi",
    address: "Autour de moi",
    icon: () => <i style={{ paddingRight: "0.375rem" }} className={fr.cx("ri-map-pin-line")}></i>,
  },
  {
    text: "Marseille",
    address: "98 Quai du Port 13002 Marseille",
    icon: () => (
      <StyledSvgIcon>
        <MarseilleIcon />
      </StyledSvgIcon>
    ),
  },
  {
    text: "Limoges",
    address: "5 Rue Jean Pierre Timbaud 87000 Limoges",
    icon: () => (
      <StyledSvgIcon>
        <LimogesIcon />
      </StyledSvgIcon>
    ),
  },
  {
    text: "Paris",
    address: "29 rue de Rivoli 75004 Paris",
    icon: () => (
      <StyledSvgIcon>
        <ParisIcon />
      </StyledSvgIcon>
    ),
  },
  {
    text: "Le Guilvinec",
    address: "33 Rue de la Marine 29730 Guilvinec",
    icon: () => (
      <StyledSvgIcon>
        <GuilvinecIcon />
      </StyledSvgIcon>
    ),
  },
];

export async function fetchAddress(
  address: string,
  { signal }: { signal: AbortSignal | undefined } = { signal: undefined }
): Promise<{
  features: {
    properties: {
      city: string;
      postcode: string;
      [key: string]: any;
    };
    geometry: {
      coordinates: [number, number];
    };
  }[];
} | null> {
  if (!address || address.trim().length < 3) {
    return null;
  }

  if (address === myPosition) {
    // get the current users location
    return await new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;

            const reverse = await fetchReverse(latitude, longitude);
            resolve({
              features: [
                {
                  ...(reverse?.features && reverse?.features.length > 0
                    ? {
                        properties: reverse?.features[0].properties,
                      }
                    : { properties: { postcode: null } }),
                  geometry: {
                    coordinates: [longitude, latitude],
                  },
                },
              ],
            });
          },
          (error) => {
            console.error("Error getting user location:", error);
            reject(new ErrorUserGeolocation());
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
        reject(new ErrorUserGeolocation());
      }
    });
  }

  //TODO: gestion des erreurs
  const type = address.split(" ").length > 1 ? "" : "municipality";
  const result = await fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(address)}&type=${type}&limit=20`, {
    signal,
  });
  const json = await result.json();
  return json;
}

export async function fetchReverse(
  latitude: number,
  longitude: number,
  { signal }: { signal: AbortSignal | undefined } = { signal: undefined }
): Promise<any> {
  //TODO: gestion des erreurs
  const result = await fetch(`${API_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}`, { signal });
  const json = await result.json();
  return json;
}
