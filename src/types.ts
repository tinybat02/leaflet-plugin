import { GeoJSONObject } from "@turf/helpers";
export interface MapOptions {
  total_floors: number;
  topology: GeoJSONObject;
  polygon: GeoJSONObject;
  onlyMap: boolean;
}

export const defaults: MapOptions = {
  total_floors: 1,
  topology: null,
  polygon: null,
  onlyMap: true
};

export interface PropsOptions {
  options: MapOptions;
  onOptionsChange: (options: MapOptions) => void;
}
