import { GeoJSONObject } from '@turf/helpers';
export interface MapOptions {
  total_floors: number;
  topology: GeoJSONObject;
  polygon: GeoJSONObject;
}

export const defaults: MapOptions = {
  total_floors: 1,
  topology: null,
  polygon: null,
};

export interface PropsOptions {
  options: MapOptions;
  onOptionsChange: (options: MapOptions) => void;
}
