export type UserLocation = {
  address: { [key: string]: any };
  coordinate: [number, number];
  longitude: number;
  latitude: number;
  city: string;
  postcode: string;
  academie: string | null;
};
