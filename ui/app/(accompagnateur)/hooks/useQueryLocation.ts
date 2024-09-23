import { useSearchParams } from "next/navigation";

export const useQueryLocation = () => {
  const searchParams = useSearchParams();
  const longitude = searchParams.get("longitude");
  const latitude = searchParams.get("latitude");

  return {
    longitude: longitude ? parseFloat(longitude) : null,
    latitude: latitude ? parseFloat(latitude) : null,
  };
};
