import { myPosition } from "#/app/components/form/AddressField";
import { fetchAddress, fetchReverse } from "#/app/services/address";
import { useQuery } from "@tanstack/react-query";
import ErrorAddressInvalid from "../errors/ErrorAddressInvalid";

export function useGetReverseAddress(
  { latitude, longitude }: { latitude: number | null; longitude: number | null },
  options = {}
) {
  return useQuery({
    placeholderData: (previousData: any) => {
      return previousData;
    },
    queryKey: ["reverse", latitude, longitude],
    queryFn: async () => {
      if (!latitude || !longitude) {
        return null;
      }
      const result = await fetchReverse(latitude, longitude);
      if (result?.features?.length > 0) {
        const address = result.features[0].properties;
        return address;
      }
    },
    cacheTime: Infinity,
    staleTime: Infinity,
    keepPreviousData: true,
    ...options,
  });
}

export function useGetAddress(address: string | undefined, options = {}) {
  return useQuery({
    // TODO : type
    placeholderData: (previousData: any) => {
      return previousData;
    },
    queryKey: ["address", address],
    queryFn: async () => {
      if (!address) {
        return null;
      }
      return await fetchAddress(address);
    },
    cacheTime: Infinity,
    staleTime: Infinity,
    keepPreviousData: true,
    ...options,
  });
}

export function useGetAddressWithCity(address: string | undefined, options = {}) {
  return useGetAddress(address, {
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
}
