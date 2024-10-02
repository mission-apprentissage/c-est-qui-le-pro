import ErrorUserGeolocation from "../(accompagnateur)/errors/ErrorUserGeolocation";
import { myPosition } from "../components/form/AddressField";

const API_BASE_URL = "https://api-adresse.data.gouv.fr";

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
