import { myPosition } from "#/app/components/form/AddressField";
import { fetchAddress } from "#/app/services/address";
import { useQuery } from "@tanstack/react-query";

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
