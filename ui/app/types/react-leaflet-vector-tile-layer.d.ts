declare module "react-leaflet-vector-tile-layer" {
  import { TileLayerOptions, LayerProps } from "leaflet";

  export interface VectorTileLayerProps extends TileLayerOptions, LayerProps {
    styleUrl: string | { [key: string]: any };
  }

  declare const VectorTileLayer: import("react").ForwardRefExoticComponent<
    VectorTileLayerProps & import("react").RefAttributes<L.TileLayer>
  >;
  export default VectorTileLayer;
}
