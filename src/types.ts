import { GeoJSONObject } from "@turf/helpers";
export interface MapOptions {
  total_floors: number;
  default_floor: number;
  topology: GeoJSONObject;
  polygon: GeoJSONObject;
  onlyMap: boolean;
  heatMap: boolean;
}

export const defaults: MapOptions = {
  total_floors: 1,
  default_floor: 0,
  topology: null,
  polygon: null,
  onlyMap: true,
  heatMap: false
};

export interface PropsOptions {
  options: MapOptions;
  onOptionsChange: (options: MapOptions) => void;
}
